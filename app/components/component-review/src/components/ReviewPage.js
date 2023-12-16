import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { useMutation, useQuery, gql } from '@apollo/client'
import { Redirect } from 'react-router-dom'
import ReactRouterPropTypes from 'react-router-prop-types'
import { useTranslation } from 'react-i18next'
import { ConfigContext } from '../../../config/src'
import ReviewLayout from './review/ReviewLayout'
import { Heading, Page, Spinner } from '../../../shared'
import manuscriptVersions from '../../../../shared/manuscript_versions'
import {
  UPDATE_PENDING_COMMENT,
  COMPLETE_COMMENTS,
  COMPLETE_COMMENT,
  DELETE_PENDING_COMMENT,
} from '../../../component-formbuilder/src/components/builderComponents/ThreadedDiscussion/queries'
import { UPDATE_REVIEWER_STATUS_MUTATION } from '../../../../queries/team'
import useChat from '../../../../hooks/useChat'

const createFileMutation = gql`
  mutation($file: Upload!, $meta: FileMetaInput!) {
    createFile(file: $file, meta: $meta) {
      id
      created
      name
      updated
      name
      tags
      objectId
      storedObjects {
        key
        mimetype
        url
      }
    }
  }
`

const deleteFileMutation = gql`
  mutation($id: ID!) {
    deleteFile(id: $id)
  }
`

const reviewFields = `
  id
  created
  updated
  jsonData
  isDecision
  isHiddenReviewerName
  canBePublishedPublicly
  isSharedWithCurrentUser
  user {
    id
    username
    defaultIdentity {
      id
      identifier
    }
  }
`

const fragmentFields = `
  id
  shortId
  created
  files {
    id
    created
    updated
    name
    tags
    storedObjects {
      key
      mimetype
      url
    }
  }
  reviews {
    ${reviewFields}
  }
  decision
  teams {
    id
    name
    role
    objectId
    objectType
    members {
      id
      user {
        id
        username
      }
      status
      isShared
    }
  }
  status
  meta {
    manuscriptId
    source
    history {
      type
      date
    }
  }
  submission
`

const formStructure = `
  structure {
    name
    description
    haspopup
    popuptitle
    popupdescription
    children {
      title
      shortDescription
      id
      component
      name
      description
      doiValidation
      doiUniqueSuffixValidation
      placeholder
      parse
      format
      options {
        id
        label
        labelColor
        value
      }
      validate {
        id
        label
        value
      }
      validateValue {
        minChars
        maxChars
        minSize
      }
      hideFromReviewers
      readonly
    }
  }
`

const query = gql`
  query($id: ID!, $groupId: ID) {
    manuscript(id: $id) {
      parentId
      ${fragmentFields}
      manuscriptVersions {
        ${fragmentFields}
      }
      channels {
        id
        type
        topic
      }
    }

    threadedDiscussions(manuscriptId: $id) {
      id
      created
      updated
      manuscriptId
      threads {
        id
        comments {
          id
          manuscriptVersionId
          commentVersions {
            id
            author {
              id
              username
              profilePicture
            }
            comment
            created
          }
          pendingVersion {
            author {
              id
              username
              profilePicture
            }
            comment
          }
        }
      }
      userCanAddComment
      userCanEditOwnComment
      userCanEditAnyComment
    }

    submissionForm: formForPurposeAndCategory(purpose: "submit", category: "submission", groupId: $groupId) {
      ${formStructure}
    }

    reviewForm: formForPurposeAndCategory(purpose: "review", category: "review", groupId: $groupId) {
      ${formStructure}
    }

    decisionForm: formForPurposeAndCategory(purpose: "decision", category: "decision", groupId: $groupId) {
      ${formStructure}
    }
  }
`

const updateReviewMutationQuery = gql`
  mutation($id: ID, $input: ReviewInput) {
    updateReview(id: $id, input: $input) {
      ${reviewFields}
    }
  }
`

const ReviewPage = ({ currentUser, history, match }) => {
  const { t } = useTranslation()
  const config = useContext(ConfigContext)
  const { urlFrag } = config
  const [updateReviewMutation] = useMutation(updateReviewMutationQuery)
  const [updateReviewerStatus] = useMutation(UPDATE_REVIEWER_STATUS_MUTATION)
  const [createFile] = useMutation(createFileMutation)
  const [updatePendingComment] = useMutation(UPDATE_PENDING_COMMENT)
  const [completeComments] = useMutation(COMPLETE_COMMENTS)
  const [completeComment] = useMutation(COMPLETE_COMMENT)
  const [deletePendingComment] = useMutation(DELETE_PENDING_COMMENT)

  const [deleteFile] = useMutation(deleteFileMutation, {
    update(cache, { data: { deleteFile: fileToDelete } }) {
      const id = cache.identify({
        __typename: 'File',
        id: fileToDelete,
      })

      cache.evict({ id })
    },
  })

  const { loading, error, data } = useQuery(query, {
    variables: {
      id: match.params.version,
      groupId: config.groupId,
    },
    partialRefetch: true,
  })

  let editorialChannelId

  if (
    Array.isArray(data?.manuscript.channels) &&
    data?.manuscript.channels.length
  ) {
    const editorialChannel = data?.manuscript.channels.find(
      c => c.type === 'editorial',
    )

    editorialChannelId = editorialChannel?.id
  }

  const channels = [
    {
      id: editorialChannelId,
      name: t('chat.Discussion with editorial team'),
      type: 'editorial',
    },
  ]

  const chatProps = useChat(channels)

  if (loading || currentUser === null) return <Spinner />

  if (error) {
    console.warn(error.message)
    return (
      <Page>
        <Heading>This review is no longer accessible.</Heading>
      </Page>
    )
  }

  const { manuscript, threadedDiscussions } = data
  // We shouldn't arrive at this page with a subsequent/child manuscript ID. If we do, redirect to the parent/original ID
  if (manuscript.parentId)
    return <Redirect to={`${urlFrag}/versions/${manuscript.parentId}/review`} />

  const versions = manuscriptVersions(manuscript)

  const submissionForm = data.submissionForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const reviewForm = data.reviewForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const decisionForm = data.decisionForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const channelId = manuscript.channels.find(c => c.type === 'editorial')?.id
  if (!channelId)
    console.error(
      `Malformed channels in manuscript ${manuscript.id}:`,
      manuscript.channels,
    )

  const threadedDiscussionProps = {
    threadedDiscussions,
    updatePendingComment,
    completeComment,
    completeComments,
    deletePendingComment,
    currentUser,
    firstVersionManuscriptId: manuscript.parentId || manuscript.id,
  }

  return (
    <ReviewLayout
      channelId={channelId}
      channels={channels}
      chatProps={chatProps}
      createFile={createFile}
      currentUser={currentUser}
      decisionForm={decisionForm}
      deleteFile={deleteFile}
      history={history}
      manuscript={manuscript}
      reviewForm={reviewForm}
      submissionForm={submissionForm}
      threadedDiscussionProps={threadedDiscussionProps}
      updateReviewerStatus={updateReviewerStatus}
      updateReviewMutation={updateReviewMutation}
      versions={versions}
    />
  )
}

ReviewPage.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
}

export default ReviewPage
