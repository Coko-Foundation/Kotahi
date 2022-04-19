import React, { useRef, useEffect } from 'react'
import { useMutation, useQuery, gql } from '@apollo/client'
import { Formik } from 'formik'
// import { cloneDeep } from 'lodash'
import config from 'config'
import { Redirect } from 'react-router-dom'
import ReactRouterPropTypes from 'react-router-prop-types'
import ReviewLayout from './review/ReviewLayout'
import { Heading, Page, Spinner } from '../../../shared'
import useCurrentUser from '../../../../hooks/useCurrentUser'
import manuscriptVersions from '../../../../shared/manuscript_versions'

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

const commentFields = `
id
commentType
content
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
`

const reviewFields = `
  id
  created
  updated
  reviewComment {
    ${commentFields}
  }
  confidentialComment {
    ${commentFields}
  }
  decisionComment {
    ${commentFields}
  }
  isDecision
  isHiddenReviewerName
  recommendation
  canBePublishedPublicly
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
    manuscript {
      id
    }
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
    declarations {
      openData
      openPeerReview
      preregistered
      previouslySubmitted
      researchNexus
      streamlinedReview
    }
    articleSections
    articleType
    history {
      type
      date
    }
    notes {
      notesType
      content
    }
    keywords
  }
  submission
  suggestions {
    reviewers {
      opposed
      suggested
    }
    editors {
      opposed
      suggested
    }
  }
`

const query = gql`
  query($id: ID!) {
    currentUser {
      id
      username
      admin
    }

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

    formForPurposeAndCategory(purpose: "submit", category: "submission") {
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
          placeholder
          parse
          format
          options {
            id
            label
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
        }
      }
    }
  }
`

const completeReviewMutation = gql`
  mutation($id: ID!) {
    completeReview(id: $id) {
      id
      status
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

const urlFrag = config.journal.metadata.toplevel_urlfragment

const ReviewPage = ({ match, ...props }) => {
  const currentUser = useCurrentUser()
  const [updateReviewMutation] = useMutation(updateReviewMutationQuery)
  const [completeReview] = useMutation(completeReviewMutation)
  const [createFile] = useMutation(createFileMutation)

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
    },
    partialRefetch: true,
  })

  const reviewOrInitial = manuscript =>
    manuscript?.reviews?.find(
      review => review?.user?.id === currentUser?.id && !review.isDecision,
    ) || {}

  const versions = data
    ? manuscriptVersions(data.manuscript).map(v => v.manuscript)
    : []

  const latestVersion = versions.length ? versions[0] : null

  // Find an existing review or create a placeholder, and hold a ref to it
  const existingReview = useRef(reviewOrInitial(latestVersion))

  // Update the value of that ref if the manuscript object changes
  useEffect(() => {
    existingReview.current = reviewOrInitial(latestVersion)
  }, [latestVersion?.reviews])

  if (loading) return <Spinner />

  if (error) {
    console.warn(error.message)
    return (
      <Page>
        <Heading>This review is no longer accessible.</Heading>
      </Page>
    )
  }

  const { manuscript, formForPurposeAndCategory } = data

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

  const submissionForm = formForPurposeAndCategory?.structure ?? {
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

  const { status } =
    (
      (latestVersion.teams.find(team => team.role === 'reviewer') || {})
        .status || []
    ).find(statusTemp => statusTemp.user === currentUser?.id) || {}

  const updateReview = review => {
    const reviewData = {
      recommendation: review.recommendation,
      manuscriptId: latestVersion.id,
      reviewComment: review.reviewComment && {
        id: existingReview.current.reviewComment?.id,
        commentType: 'review',
        content: review.reviewComment.content,
      },
      confidentialComment: review.confidentialComment && {
        id: existingReview.current.confidentialComment?.id,
        commentType: 'confidential',
        content: review.confidentialComment.content,
      },
      canBePublishedPublicly: review.canBePublishedPublicly,
    }

    return updateReviewMutation({
      variables: {
        id: existingReview.current.id || undefined,
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

  const handleSubmit = async ({ reviewId, history }) => {
    await completeReview({
      variables: {
        id: reviewId,
      },
    })

    history.push(`${urlFrag}/dashboard`)
  }

  const initialValues = {
    ...(latestVersion.reviews?.find(
      review => review?.user?.id === currentUser?.id && !review.isDecision,
    ) || {
      id: null,
      comments: [],
      recommendation: null,
    }),
  }

  if (!initialValues.canBePublishedPublicly)
    initialValues.canBePublishedPublicly = false

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={values =>
        handleSubmit({
          reviewId: existingReview.current.id,
          history: props.history,
        })
      }
      validateOnMount={review => {
        if (!review.id) return false
        const hasRecommendation = review.recommendation !== null
        const comment = review.decisionComment?.content
        const isCommented = comment !== null && comment !== ''

        return isCommented && hasRecommendation
      }}
    >
      {formikProps => (
        <ReviewLayout
          channelId={channelId}
          currentUser={currentUser}
          review={existingReview}
          status={status}
          submissionForm={submissionForm}
          updateReview={updateReview}
          versions={versions}
          {...formikProps}
          createFile={createFile}
          deleteFile={deleteFile}
        />
      )}
    </Formik>
  )
}

ReviewPage.propTypes = {
  match: ReactRouterPropTypes.match.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
}

export default ReviewPage
