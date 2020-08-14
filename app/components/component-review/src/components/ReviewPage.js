import React, { useRef, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { Formik } from 'formik'
// import { cloneDeep } from 'lodash'
import ReviewLayout from '../components/review/ReviewLayout'
import { Spinner } from '../../../shared'
import useCurrentUser from '../../../../hooks/useCurrentUser'

const commentFields = `
id
commentType
content
files {
  id
  created
  label
  filename
  fileType
  mimeType
  size
  url
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
  isDecision
  recommendation
  user {
    id
    username
  }
`

const fragmentFields = `
  id
  created
  files {
    id
    created
    label
    filename
    fileType
    mimeType
    size
    url
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

export default ({ match, ...props }) => {
  const currentUser = useCurrentUser()
  const [updateReviewMutation] = useMutation(updateReviewMutationQuery)
  const [completeReview] = useMutation(completeReviewMutation)

  const { loading, error, data } = useQuery(query, {
    variables: {
      id: match.params.version,
    },
  })

  const reviewOrInitial = manuscript =>
    (manuscript &&
      manuscript.reviews &&
      manuscript.reviews.find(
        review => review?.user?.id === currentUser.id && !review.isDecision,
      )) ||
    {}

  // Find an existing review or create a placeholder, and hold a ref to it
  const existingReview = useRef(reviewOrInitial(data?.manuscript))

  // Update the value of that ref if the manuscript object changes
  useEffect(() => {
    existingReview.current = reviewOrInitial(data?.manuscript)
  }, [data?.manuscript?.reviews])

  if (loading) return <Spinner />
  if (error) return `Error! ${error.message}`

  const { manuscript } = data
  const channelId = manuscript.channels.find(c => c.type === 'editorial').id

  // eslint-disable-next-line
  const status = (
    (
      (manuscript.teams.find(team => team.role === 'reviewer') || {}).status ||
      []
    ).find(status => status.user === currentUser.id) || {}
  ).status

  const updateReview = (review, file) => {
    const reviewData = {
      recommendation: review.recommendation,
      manuscriptId: manuscript.id,
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
    }

    return updateReviewMutation({
      variables: {
        id: existingReview.current.id || undefined,
        input: reviewData,
      },
      update: (cache, { data: { updateReview } }) => {
        cache.modify({
          id: cache.identify(manuscript),
          fields: {
            reviews(existingReviewRefs = [], { readField }) {
              const newReviewRef = cache.writeFragment({
                data: updateReview,
                fragment: gql`
                  fragment NewReview on Review {
                    id
                  }
                `,
              })

              if (
                existingReviewRefs.some(
                  ref => readField('id', ref) === updateReview.id,
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

    history.push('/journal/dashboard')
  }

  return (
    <Formik
      initialValues={
        (manuscript.reviews &&
          manuscript.reviews.find(
            review => review?.user?.id === currentUser.id && !review.isDecision,
          )) || {
          id: null,
          comments: [],
          recommendation: null,
        }
      }
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
          manuscript={manuscript}
          review={existingReview}
          status={status}
          updateReview={updateReview}
          {...formikProps}
        />
      )}
    </Formik>
  )
}
