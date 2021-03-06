import React, { useRef, useEffect } from 'react'
import { Formik } from 'formik'
import { useMutation, useQuery, gql } from '@apollo/client'
import config from 'config'
import { get } from 'lodash'
import DecisionForm from './decision/DecisionForm'
import DecisionReviews from './decision/DecisionReviews'
import AssignEditorsReviewers from './assignEditors/AssignEditorsReviewers'
import AssignEditor from './assignEditors/AssignEditor'
import ReviewMetadata from './metadata/ReviewMetadata'
import EditorSection from './decision/EditorSection'
import Publish from './Publish'
import { AdminSection } from './style'
import {
  Spinner,
  Tabs,
  SectionContent,
  SectionHeader,
  SectionRow,
  Title,
} from '../../../shared'
import { query, updateReviewMutation, makeDecisionMutation } from './queries'
import DecisionAndReviews from '../../../component-submit/src/components/DecisionAndReviews'

const addEditor = (manuscript, label) => ({
  content: <EditorSection manuscript={manuscript} />,
  key: `editor_${manuscript.id}`,
  label,
})

const DecisionVersion = ({ label, current, version, parent }) => {
  // Hooks from the old world
  const [makeDecision] = useMutation(makeDecisionMutation)
  const [doUpdateReview] = useMutation(updateReviewMutation)

  const reviewOrInitial = manuscript =>
    (manuscript &&
      manuscript.reviews &&
      manuscript.reviews.find(review => review.isDecision)) || {
      decisionComment: {},
      isDecision: true,
      recommendation: null,
    }

  const { loading, error, data } = useQuery(query, {
    variables: {
      id: version.id,
    },
    // fetchPolicy: 'cache-and-network',
  })

  // Find an existing review or create a placeholder, and hold a ref to it
  const existingReview = useRef(reviewOrInitial(data?.manuscript))

  // Update the value of that ref if the manuscript object changes
  useEffect(() => {
    existingReview.current = reviewOrInitial(data?.manuscript)
  }, [data?.manuscript?.reviews])

  if (loading) return <Spinner />
  if (error) return `Error! ${error.message}`

  const { manuscript } = data

  const updateReview = manuscriptId => review => {
    const reviewData = {
      recommendation: review.recommendation,
      manuscriptId,
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

  const editorSection = addEditor(manuscript, 'Manuscript text')

  const decisionSection = ({
    handleSubmit,
    dirty,
    isValid,
    submitCount,
    isSubmitting,
  }) => ({
    content: (
      <>
        {!current && (
          <SectionContent>
            <SectionHeader>
              <Title>Archived version</Title>
            </SectionHeader>
            <SectionRow>
              This is not the current, but an archived read-only version of the
              manuscript.
            </SectionRow>
          </SectionContent>
        )}
        {current && (
          <AdminSection>
            <AssignEditorsReviewers
              AssignEditor={AssignEditor}
              manuscript={parent}
            />
          </AdminSection>
        )}
        {!current && (
          <SectionContent>
            <SectionHeader>
              <Title>Assigned editors</Title>
            </SectionHeader>
            <SectionRow>
              {parent.teams?.map(team => {
                if (['seniorEditor', 'handlingEditor'].includes(team.role)) {
                  return (
                    <p key={team.id}>
                      {get(config, `teams.${team.role}.name`)}:{' '}
                      {team.members?.[0]?.user?.defaultIdentity?.name}
                    </p>
                  )
                }
              })}
            </SectionRow>
          </SectionContent>
        )}
        {!current && <DecisionAndReviews manuscript={version} />}
        <AdminSection key="review-metadata">
          <ReviewMetadata manuscript={version} />
        </AdminSection>
        {current && (
          <AdminSection key="decision-review">
            <DecisionReviews manuscript={version} />
          </AdminSection>
        )}
        {current && (
          <AdminSection key="decision-form">
            <DecisionForm
              dirty={dirty}
              handleSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isValid={isValid}
              submitCount={submitCount}
              updateReview={updateReview(version.id)}
            />
          </AdminSection>
        )}
        {current && (
          <AdminSection>
            <Publish manuscript={version} />
          </AdminSection>
        )}
      </>
    ),
    key: version.id,
    label: 'Workflow & metadata',
  })

  return (
    <Formik
      displayName="decision"
      initialValues={reviewOrInitial(version)}
      onSubmit={values =>
        makeDecision({
          variables: {
            id: version.id,
            decision: values.recommendation,
          },
        })
      }
      validate={(values, props) => {
        const errors = {}
        if (
          ['', '<p></p>', undefined].includes(values.decisionComment?.content)
        ) {
          errors.decisionComment = 'Decision letter is required'
        }

        if (values.recommendation === null) {
          errors.recommendation = 'Decision is required'
        }
        return errors
      }}
    >
      {props => (
        <Tabs
          defaultActiveKey={version.id}
          sections={[decisionSection({ ...props }), editorSection]}
        />
      )}
    </Formik>
  )
}

export default DecisionVersion
