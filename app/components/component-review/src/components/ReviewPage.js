import React, { useCallback, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import { v4 as uuid } from 'uuid'
import { useMutation, useQuery, gql } from '@apollo/client'
import { Redirect } from 'react-router-dom'
import ReactRouterPropTypes from 'react-router-prop-types'
import { set, debounce } from 'lodash'
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
    title
    source
    abstract
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

  const { loading, error, data, refetch } = useQuery(query, {
    variables: {
      id: match.params.version,
      groupId: config.groupId,
    },
    partialRefetch: true,
  })

  const reviewOrInitial = manuscript =>
    manuscript?.reviews?.find(
      review => review?.user?.id === currentUser?.id && !review.isDecision,
    ) || {
      // Usually a blank review is created when the user accepts the review invite.
      // Creating a new review object here is a fallback for unknown error situations
      // when the blank review was not created in advance for some reason.
      id: uuid(),
      isDecision: false,
      isHiddenReviewerName: true,
      jsonData: {},
    }

  const versions = data
    ? manuscriptVersions(data.manuscript).map(v => ({
        ...v.manuscript,
        reviews: v.manuscript.reviews.map(r => ({
          ...r,
          jsonData: JSON.parse(r.jsonData),
        })),
      }))
    : []

  const latestVersion = versions.length ? versions[0] : null

  // Find an existing review or create a placeholder, and hold a ref to it
  const existingReview = reviewOrInitial(latestVersion)

  const updateReviewJsonData = (value, path) => {
    if (!latestVersion.id) {
      // we shouldn't need this because of debouncing! But this protects against trying to save while loading is still happening
      // eslint-disable-next-line no-console
      console.log('no version id!')
      return false
    }

    const reviewDelta = {} // Only the changed fields
    // E.g. if path is 'foo.bar' and value is 'Baz' this gives { foo: { bar: 'Baz' } }
    set(reviewDelta, path, value)

    const reviewPayload = {
      isDecision: false,
      jsonData: JSON.stringify(reviewDelta),
      manuscriptId: latestVersion.id,
      userId: currentUser.id,
    }

    return updateReviewMutation({
      variables: { id: existingReview.id, input: reviewPayload },
      update: (cache, { data: { updateReview: updateReviewTemp } }) => {
        cache.modify({
          id: cache.identify({
            __typename: 'Manuscript',
            id: latestVersion.id,
          }),
          fields: {
            reviews(existingReviewRefs = [], { readField }) {
              const newReviewRef = cache.writeFragment({
                data: updateReviewTemp,
                fragment: gql`
                  fragment NewReview on Review {
                    id
                  }
                `,
              })

              if (
                existingReviewRefs.some(
                  ref => readField('id', ref) === updateReviewTemp.id,
                )
              ) {
                return existingReviewRefs
              }

              return [...existingReviewRefs, newReviewRef]
            },
          },
        })
      },
    })
  }

  const debouncedUpdateReviewJsonData = useCallback(
    debounce(updateReviewJsonData ?? (() => {}), 1000),
    [latestVersion?.id],
  )

  useEffect(() => debouncedUpdateReviewJsonData.flush, [])

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

  if (
    !latestVersion.reviews?.find(
      review => review?.user?.id === currentUser?.id && !review.isDecision,
    )
  ) {
    refetch()
  }

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

  const reviewersTeam = latestVersion.teams.find(
    team => team.role === 'reviewer',
  ) || { members: [] }

  const reviewerStatus = reviewersTeam.members.find(
    member => member.user.id === currentUser?.id,
  )?.status

  const updateReview = review => {
    const reviewData = {
      manuscriptId: latestVersion.id,
      canBePublishedPublicly: review.canBePublishedPublicly,
      jsonData: JSON.stringify(review.jsonData),
    }

    return updateReviewMutation({
      variables: {
        id: existingReview.id || undefined,
        input: reviewData,
      },
      update: (cache, { data: { updateReviewTemp } }) => {
        cache.modify({
          id: cache.identify(latestVersion.id),
          fields: {
            reviews(existingReviewRefs = [], { readField }) {
              const newReviewRef = cache.writeFragment({
                data: updateReviewTemp,
                fragment: gql`
                  fragment NewReview on Review {
                    id
                  }
                `,
              })

              if (
                existingReviewRefs.some(
                  ref => readField('id', ref) === updateReviewTemp.id,
                )
              ) {
                return existingReviewRefs
              }

              return [...existingReviewRefs, newReviewRef]
            },
          },
        })
      },
    })
  }

  const handleSubmit = async () => {
    await updateReviewerStatus({
      variables: {
        status: 'completed',
        manuscriptId: latestVersion.id,
      },
    })

    history.push(`${urlFrag}/dashboard`)
  }

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
      createFile={createFile}
      currentUser={currentUser}
      decisionForm={decisionForm}
      deleteFile={deleteFile}
      onSubmit={handleSubmit}
      review={existingReview}
      reviewForm={reviewForm}
      status={reviewerStatus}
      submissionForm={submissionForm}
      threadedDiscussionProps={threadedDiscussionProps}
      updateReview={updateReview}
      updateReviewJsonData={debouncedUpdateReviewJsonData}
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
