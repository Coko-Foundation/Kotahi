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
import Publish from './Publish'

import { AdminSection, Columns, Manuscript, Chat } from './style'

import { Spinner } from '../../../shared'

import MessageContainer from '../../../component-chat/src'

import { query, updateReviewMutation, makeDecisionMutation } from './queries'

const addEditor = (manuscript, label) => ({
  content: <EditorSection manuscript={manuscript} />,
  key: `editor_${manuscript.id}`,
  label,
})

const dateLabel = date => moment(date).format('YYYY-MM-DD')

const decisionSections = ({
  manuscript,
  handleSubmit,
  isValid,
  updateReview,
  uploadFile,
  isSubmitting,
  submitCount,
  dirty,
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
            dirty={dirty}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isValid={isValid}
            submitCount={submitCount}
            updateReview={updateReview}
            uploadFile={uploadFile}
          />
        </AdminSection>
        <AdminSection>
          <Publish manuscript={manuscript} />
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
  const [doUpdateReview] = useMutation(updateReviewMutation)

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
      decisionComment: {},
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

    return doUpdateReview({
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

  const sections = props =>
    decisionSections({
      manuscript,
      handleSubmit: props.handleSubmit,
      isValid: props.isValid,
      updateReview,
      isSubmitting: props.isSubmitting,
      submitCount: props.submitCount,
      dirty: props.dirty,
    })

  return (
    <Columns>
      <Manuscript>
        <Formik
          displayName="decision"
          initialValues={reviewOrInitial(data.manuscript)}
          onSubmit={values =>
            makeDecision({
              variables: {
                id: manuscript.id,
                decision: values.recommendation,
              },
            })
          }
          validate={(values, props) => {
            const errors = {}
            if (
              ['', '<p></p>', undefined].includes(
                values.decisionComment?.content,
              )
            ) {
              errors.decisionComment = 'Decision letter is required'
            }

            if (values.recommendation === null) {
              errors.recommendation = 'Decision is required'
            }
            return errors
          }}
          // validateOnMount
        >
          {props => (
            // TODO: Find a nicer way to display the contents of a manuscript
            <>
              {/* <Tabs
                activeKey={
                  editorSectionsResult[editorSectionsResult.length - 1].key
                }
                sections={editorSectionsResult}
                title="Versions"
              /> */}
              <Tabs
                activeKey={sections(props)[decisionSections.length - 1].key}
                sections={sections(props)}
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
