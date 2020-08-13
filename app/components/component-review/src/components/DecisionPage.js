import React, { useRef, useEffect } from 'react'
import moment from 'moment'

import { Tabs } from '@pubsweet/ui'
import { Formik } from 'formik'
import { useMutation, useQuery, gql } from '@apollo/client'
import DecisionForm from './decision/DecisionForm'
import DecisionReviews from './decision/DecisionReviews'
import AssignEditorsReviewers from './assignEditors/AssignEditorsReviewers'
import AssignEditor from './assignEditors/AssignEditor'
import ReviewMetadata from './metadata/ReviewMetadata'
import Decision from './decision/Decision'
import EditorSection from './decision/EditorSection'
import { AdminSection, Columns, Manuscript, Chat } from './style'

import { Spinner } from '../../../shared'

import MessageContainer from '../../../component-chat/src'

const addEditor = (manuscript, label) => ({
  content: <EditorSection manuscript={manuscript} />,
  key: `editor_${manuscript.id}`,
  label,
})

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
  decisionComment {
    ${commentFields}
  }
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

const updateReviewMutationQuery = gql`
  mutation($id: ID, $input: ReviewInput) {
    updateReview(id: $id, input: $input) {
      ${reviewFields}
    }
  }
`

const makeDecisionMutation = gql`
  mutation($id: ID!, $decision: String) {
    makeDecision(id: $id, decision: $decision) {
      id
      ${fragmentFields}
    }
  }
`
const dateLabel = date => moment(date).format('YYYY-MM-DD')

const decisionSections = ({
  manuscript,
  handleSubmit,
  isValid,
  updateReview,
  uploadFile,
}) => {
  const decisionSections = []
  const manuscriptVersions = manuscript.manuscriptVersions || []
  manuscriptVersions.forEach(manuscript => {
    decisionSections.push({
      content: (
        <>
          <ReviewMetadata manuscript={manuscript} />
          <DecisionReviews manuscript={manuscript} />
          <Decision
            review={manuscript.reviews.find(review => review.isDecision)}
          />
        </>
      ),
      key: manuscript.id,
      label: dateLabel(manuscript.updated),
    })
  }, [])

  const decisionSection = {
    content: (
      <>
        <AdminSection key="assign-editors">
          <AssignEditorsReviewers
            AssignEditor={AssignEditor}
            manuscript={manuscript}
          />
        </AdminSection>
        <AdminSection key="review-metadata">
          <ReviewMetadata manuscript={manuscript} />
        </AdminSection>
        <AdminSection key="decision-review">
          <DecisionReviews manuscript={manuscript} />
        </AdminSection>
        <AdminSection key="decision-form">
          <DecisionForm
            handleSubmit={handleSubmit}
            isValid={isValid}
            updateReview={updateReview}
            uploadFile={uploadFile}
          />
        </AdminSection>
      </>
    ),
    key: manuscript.id,
    label: 'Metadata',
  }

  const editorSection = addEditor(manuscript, 'Content')

  if (manuscript.status !== 'revising') {
    decisionSections.push({
      content: (
        <Tabs
          activeKey={manuscript.id}
          sections={[decisionSection, editorSection]}
          title="Manuscript"
        />
      ),
      /*

          <AdminSection key="assign-editors">
            <AssignEditorsReviewers
              AssignEditor={AssignEditor}
              manuscript={manuscript}
            />
          </AdminSection>
          <AdminSection key="review-metadata">
            <ReviewMetadata manuscript={manuscript} />
          </AdminSection>
          <AdminSection key="decision-review">
            <DecisionReviews manuscript={manuscript} />
          </AdminSection>
          <AdminSection key="decision-form">
            <DecisionForm
              handleSubmit={handleSubmit}
              isValid={isValid}
              updateReview={updateReview}
              uploadFile={uploadFile}
            />
          </AdminSection>
        </>
      ), */

      key: manuscript.id,
      label: dateLabel(),
    })
  }

  return decisionSections
}

// const editorSections = ({ manuscript }) => {
//   const editorSections = []
//   const manuscriptVersions = manuscript.manuscriptVersions || []
//   manuscriptVersions.forEach(manuscript => {
//     editorSections.push(addEditor(manuscript, dateLabel(manuscript.updated)))
//   }, [])

//   if (manuscript.status !== 'revising') {
//     editorSections.push(addEditor(manuscript, dateLabel()))
//   }

//   return editorSections
// }

const DecisionPage = ({ match }) => {
  // Hooks from the old world
  const [makeDecision] = useMutation(makeDecisionMutation)
  const [updateReviewMutation] = useMutation(updateReviewMutationQuery)

  const { loading, error, data } = useQuery(query, {
    variables: {
      id: match.params.version,
    },
    // fetchPolicy: 'cache-and-network',
  })

  const reviewOrInitial = manuscript =>
    (manuscript &&
      manuscript.reviews &&
      manuscript.reviews.find(review => review.isDecision)) || {
      comments: [],
      isDecision: true,
      recommendation: null,
    }

  // Find an existing review or create a placeholder, and hold a ref to it
  const existingReview = useRef(reviewOrInitial(data?.manuscript))

  // Update the value of that ref if the manuscript object changes
  useEffect(() => {
    existingReview.current = reviewOrInitial(data?.manuscript)
  }, [data?.manuscript?.reviews])

  if (loading) return <Spinner />
  if (error) return `Error! ${error.message}`

  const { manuscript } = data

  // Protect if channels don't exist for whatever reason
  let channelId
  if (Array.isArray(manuscript.channels) && manuscript.channels.length) {
    channelId = manuscript.channels.find(c => c.type === 'editorial').id
  }

  const updateReview = review => {
    const reviewData = {
      recommendation: review.recommendation,
      manuscriptId: manuscript.id,
      isDecision: true,
      decisionComment: review.decisionComment && {
        id: existingReview.current.decisionComment?.id,
        commentType: 'decision',
        content: review.decisionComment.content,
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
  // const editorSectionsResult = editorSections({ manuscript })

  return (
    <Columns>
      <Manuscript>
        <Formik
          displayName="decision"
          enableReinitialize
          initialValues={existingReview}
          // isInitialValid={({ manuscript }) => {
          //   const rv =
          //     manuscript.reviews.find(review => review.isDecision) || {}
          //   const isRecommendation = rv.recommendation != null
          //   const isCommented = getCommentContent(rv, 'note') !== ''

          //   return isCommented && isRecommendation
          // }}
          onSubmit={() => {
            makeDecision({
              variables: {
                id: manuscript.id,
                decision: manuscript.reviews.find(review => review.isDecision)
                  .recommendation,
              },
            })
          }}
          // validate={(values, props) => {
          //   const errors = {}
          //   if (values.decisionComment?.content === '') {
          //     errors.decisionComment = 'Required'
          //   }

          //   if (values.recommendation === null) {
          //     errors.recommendation = 'Required'
          //   }
          //   return errors
          // }}
        >
          {props => (
            // Temp
            <>
              {/* <Tabs
                activeKey={
                  editorSectionsResult[editorSectionsResult.length - 1].key
                }
                sections={editorSectionsResult}
                title="Versions"
              /> */}
              <Tabs
                activeKey={
                  decisionSections({
                    manuscript,
                    handleSubmit: props.handleSubmit,
                    isValid: props.isValid,
                    updateReview,
                  })[decisionSections.length - 1].key
                }
                sections={decisionSections({
                  manuscript,
                  handleSubmit: props.handleSubmit,
                  isValid: props.isValid,
                  updateReview,
                })}
                title="Versions"
              />
            </>
          )}
        </Formik>
      </Manuscript>

      <Chat>{channelId && <MessageContainer channelId={channelId} />}</Chat>
    </Columns>
  )
}

export default DecisionPage
