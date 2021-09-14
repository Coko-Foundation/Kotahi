import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Formik } from 'formik'
import { useMutation, useQuery, gql } from '@apollo/client'
import config from 'config'
import { get, set } from 'lodash'
import DecisionForm from './decision/DecisionForm'
import DecisionReviews from './decision/DecisionReviews'
import AssignEditorsReviewers from './assignEditors/AssignEditorsReviewers'
import AssignEditor from './assignEditors/AssignEditor'
import EmailNotifications from './emailNotifications'
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
  CommsErrorBanner,
} from '../../../shared'
import {
  query,
  updateReviewMutation,
  makeDecisionMutation,
  sharedReviews,
} from './queries'
import DecisionAndReviews from '../../../component-submit/src/components/DecisionAndReviews'
import FormTemplate from '../../../component-submit/src/components/FormTemplate'

const createBlankSubmissionBasedOnForm = form => {
  const allBlankedFields = {}
  const fieldNames = form.children.map(field => field.name)
  fieldNames.forEach(fieldName => set(allBlankedFields, fieldName, ''))
  return allBlankedFields.submission ?? {}
}

const DecisionVersion = ({
  form,
  current,
  version,
  parent,
  // below added to handle manuscript editing:
  updateManuscript,
  // below added to handle form editing:
  onChange,
  confirming,
  toggleConfirming,
}) => {
  // Hooks from the old world
  const [makeDecision] = useMutation(makeDecisionMutation)
  const [doUpdateReview] = useMutation(updateReviewMutation)

  const addEditor = (manuscript, label, isCurrent) => {
    const isThisReadOnly = !isCurrent

    return {
      content: (
        <EditorSection
          manuscript={manuscript}
          onBlur={
            isThisReadOnly
              ? null
              : source => {
                  updateManuscript(manuscript.id, { meta: { source } })
                }
          }
          readonly={isThisReadOnly}
        />
      ),
      key: `editor_${manuscript.id}`,
      label,
    }
  }

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

  const { data: sharedReviewsList, loading: loadingSharedReviews } = useQuery(
    sharedReviews,
    {
      variables: {
        id: version.id,
      },
    },
  )

  // Find an existing review or create a placeholder, and hold a ref to it
  const existingReview = useRef(reviewOrInitial(data?.manuscript))

  // Update the value of that ref if the manuscript object changes
  useEffect(() => {
    existingReview.current = reviewOrInitial(data?.manuscript)
  }, [data?.manuscript?.reviews])

  if (loading || loadingSharedReviews) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

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
      update: (cache, { data: { updateReview: updatedReview } }) => {
        cache.modify({
          id: cache.identify(manuscript),
          fields: {
            reviews(existingReviewRefs = [], { readField }) {
              const newReviewRef = cache.writeFragment({
                data: updatedReview,
                fragment: gql`
                  fragment NewReview on Review {
                    id
                  }
                `,
              })

              if (
                existingReviewRefs.some(
                  ref => readField('id', ref) === updatedReview.id,
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

  const editorSection = addEditor(manuscript, 'Manuscript text', current)

  const decisionSection = ({
    handleSubmit,
    dirty,
    isValid,
    submitCount,
    isSubmitting,
  }) => {
    // this is only used if current version & hence editable

    const submissionValues = current
      ? createBlankSubmissionBasedOnForm(form)
      : {}

    Object.assign(submissionValues, JSON.parse(manuscript.submission))

    const versionValues = {
      ...manuscript,
      submission: submissionValues,
    }

    const versionId = manuscript.id

    return {
      content: (
        <>
          {!current && (
            <SectionContent>
              <SectionHeader>
                <Title>Archived version</Title>
              </SectionHeader>
              <SectionRow>
                This is not the current, but an archived read-only version of
                the manuscript.
              </SectionRow>
            </SectionContent>
          )}
          {current && (
            <AdminSection>
              {process.env.INSTANCE_NAME === 'colab' && (
                <EmailNotifications manuscript={manuscript} />
              )}
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
                  if (
                    ['seniorEditor', 'handlingEditor', 'editor'].includes(
                      team.role,
                    )
                  ) {
                    return (
                      <p key={team.id}>
                        {get(config, `teams.${team.role}.name`)}:{' '}
                        {team.members?.[0]?.user?.defaultIdentity?.name}
                      </p>
                    )
                  }

                  return null
                })}
              </SectionRow>
            </SectionContent>
          )}
          {!current && <DecisionAndReviews manuscript={version} />}
          <AdminSection key="review-metadata">
            {!current ? (
              <ReviewMetadata form={form} manuscript={version} />
            ) : (
              <SectionContent noGap>
                <Formik
                  displayName="submit"
                  initialValues={versionValues}
                  onSubmit={() => null}
                  validateOnBlur
                  validateOnChange={false}
                >
                  {formProps => {
                    return (
                      <FormTemplate
                        confirming={confirming}
                        onChange={(value, path) => {
                          onChange(value, path, versionId)
                        }}
                        toggleConfirming={toggleConfirming}
                        {...formProps}
                        form={form}
                        manuscript={manuscript}
                        republish={() => null}
                      />
                    )
                  }}
                </Formik>
              </SectionContent>
            )}
          </AdminSection>
          {current && (
            <AdminSection key="decision-review">
              <DecisionReviews
                manuscript={version}
                sharedReviews={sharedReviewsList.sharedReviews}
              />
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
    }
  }

  return (
    <Formik
      displayName="decision"
      initialValues={reviewOrInitial(version)}
      onSubmit={async (values, actions) => {
        await makeDecision({
          variables: {
            id: version.id,
            decision: values.recommendation,
          },
        })
        actions.setSubmitting(false)
      }}
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

DecisionVersion.propTypes = {
  updateManuscript: PropTypes.func.isRequired,
  form: PropTypes.shape({
    children: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        title: PropTypes.string,
        shortDescription: PropTypes.string,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  toggleConfirming: PropTypes.func.isRequired,
  confirming: PropTypes.bool.isRequired,
  current: PropTypes.bool.isRequired,
  version: PropTypes.shape({
    id: PropTypes.string.isRequired,
    meta: PropTypes.shape({
      notes: PropTypes.arrayOf(
        PropTypes.shape({
          notesType: PropTypes.string.isRequired,
          content: PropTypes.string.isRequired,
        }).isRequired,
      ).isRequired,
    }).isRequired,
    files: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        filename: PropTypes.string.isRequired,
      }).isRequired,
    ).isRequired,
    reviews: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        isDecision: PropTypes.bool.isRequired,
        decisionComment: PropTypes.shape({
          content: PropTypes.string,
        }),
        user: PropTypes.shape({
          username: PropTypes.string.isRequired,
          defaultIdentity: PropTypes.shape({
            name: PropTypes.string.isRequired,
          }),
        }).isRequired,
        recommendation: PropTypes.string,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  parent: PropTypes.shape({
    id: PropTypes.string.isRequired,
    teams: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        members: PropTypes.arrayOf(
          PropTypes.shape({
            user: PropTypes.shape({
              id: PropTypes.string.isRequired,
              defaultIdentity: PropTypes.shape({
                name: PropTypes.string.isRequired,
              }),
            }),
          }).isRequired,
        ),
        role: PropTypes.string.isRequired,
      }).isRequired,
    ),
  }).isRequired,
}

export default DecisionVersion
