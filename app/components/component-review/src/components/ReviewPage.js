import React, { useRef, useEffect } from 'react'
import { useMutation, useQuery, gql } from '@apollo/client'
import { Formik } from 'formik'
// import { cloneDeep } from 'lodash'
import config from 'config'
import ReactRouterPropTypes from 'react-router-prop-types'
import ReviewLayout from './review/ReviewLayout'
import { Heading, Page, Spinner } from '../../../shared'
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

    formForPurpose(purpose: "submit") {
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

  const { loading, error, data } = useQuery(query, {
    variables: {
      id: match.params.version,
    },
    partialRefetch: true,
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

  if (error) {
    console.warn(error.message)
    return (
      <Page>
        <Heading>This review is no longer accessible.</Heading>
      </Page>
    )
  }

  const { manuscript, formForPurpose } = data

  const submissionForm = formForPurpose?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  const channelId = manuscript.channels.find(c => c.type === 'editorial').id

  const { status } =
    (
      (manuscript.teams.find(team => team.role === 'reviewer') || {}).status ||
      []
    ).find(statusTemp => statusTemp.user === currentUser.id) || {}

  const updateReview = review => {
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
      update: (cache, { data: { updateReviewTemp } }) => {
        cache.modify({
          id: cache.identify(manuscript),
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
          submissionForm={submissionForm}
          updateReview={updateReview}
          {...formikProps}
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
