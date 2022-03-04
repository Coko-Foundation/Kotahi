import React, { useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Formik } from 'formik'
import { set } from 'lodash'
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
  Tabs,
  SectionContent,
  SectionHeader,
  SectionRow,
  Title,
} from '../../../shared'
import DecisionAndReviews from '../../../component-submit/src/components/DecisionAndReviews'
import FormTemplate from '../../../component-submit/src/components/FormTemplate'

const createBlankSubmissionBasedOnForm = form => {
  const allBlankedFields = {}
  const fieldNames = form?.children?.map(field => field.name)
  fieldNames.forEach(fieldName => set(allBlankedFields, fieldName, ''))
  return allBlankedFields.submission ?? {}
}

const DecisionVersion = ({
  allUsers,
  form,
  current,
  currentUser,
  version,
  parent,
  updateManuscript, // To handle manuscript editing
  onChange, // To handle form editing
  confirming,
  toggleConfirming,
  makeDecision = {},
  sendNotifyEmail,
  sendChannelMessageCb,
  publishManuscript,
  updateTeam,
  createTeam,
  updateReview,
  reviewers,
  teamLabels,
  canHideReviews,
  urlFrag,
  displayShortIdAsIdentifier,
  client,
  createFile,
  deleteFile,
}) => {
  // Hooks from the old world
  const addEditor = (manuscript, label, isCurrent, user) => {
    const isThisReadOnly = !isCurrent

    return {
      content: (
        <EditorSection
          currentUser={user}
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
    manuscript?.reviews?.find(review => review.isDecision) || {
      decisionComment: {},
      isDecision: true,
      recommendation: null,
    }

  // Find an existing review or create a placeholder, and hold a ref to it
  const existingReview = useRef(reviewOrInitial(version))

  // Update the value of that ref if the manuscript object changes
  useEffect(() => {
    existingReview.current = reviewOrInitial(version)
  }, [version.reviews])

  const updateReviewForVersion = manuscriptId => review => {
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

    return updateReview(existingReview.current.id, reviewData, manuscriptId)
  }

  const editorSection = addEditor(
    version,
    'Manuscript text',
    current,
    currentUser,
  )

  const metadataSection = () => {
    const submissionValues = current
      ? createBlankSubmissionBasedOnForm(form)
      : {}

    Object.assign(submissionValues, JSON.parse(version.submission))

    const versionValues = {
      ...version,
      submission: submissionValues,
    }

    const versionId = version.id

    return {
      content: (
        <>
          {!current ? (
            <ReviewMetadata
              displayShortIdAsIdentifier={displayShortIdAsIdentifier}
              form={form}
              manuscript={version}
              showEditorOnlyFields
            />
          ) : (
            <SectionContent>
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
                      createFile={createFile}
                      deleteFile={deleteFile}
                      onChange={(value, path) => {
                        onChange(value, path, versionId)
                      }}
                      toggleConfirming={toggleConfirming}
                      {...formProps}
                      client={client}
                      displayShortIdAsIdentifier={displayShortIdAsIdentifier}
                      form={form}
                      manuscript={version}
                      match={{ url: 'decision' }}
                      republish={() => null}
                      showEditorOnlyFields
                      urlFrag={urlFrag}
                    />
                  )
                }}
              </Formik>
            </SectionContent>
          )}
        </>
      ),
      key: `metadata_${version.id}`,
      label: 'Metadata',
    }
  }

  const decisionSection = ({
    handleSubmit,
    dirty,
    isValid,
    submitCount,
    isSubmitting,
  }) => {
    // this is only used if current version & hence editable

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
            <>
              {['aperture', 'colab'].includes(process.env.INSTANCE_NAME) && (
                <EmailNotifications
                  allUsers={allUsers}
                  currentUser={currentUser}
                  manuscript={version}
                  sendChannelMessageCb={sendChannelMessageCb}
                  sendNotifyEmail={sendNotifyEmail}
                />
              )}
              <AssignEditorsReviewers
                allUsers={allUsers}
                AssignEditor={AssignEditor}
                createTeam={createTeam}
                manuscript={parent}
                teamLabels={teamLabels}
                updateTeam={updateTeam}
              />
            </>
          )}
          {!current && (
            <SectionContent>
              <SectionHeader>
                <Title>Assigned editors</Title>
              </SectionHeader>
              <SectionRow>
                {parent?.teams?.map(team => {
                  if (
                    ['seniorEditor', 'handlingEditor', 'editor'].includes(
                      team.role,
                    )
                  ) {
                    return (
                      <p key={team.id}>
                        {teamLabels[team.role].name}:{' '}
                        {team.members?.[0]?.user?.username}
                      </p>
                    )
                  }

                  return null
                })}
              </SectionRow>
            </SectionContent>
          )}
          {!current && <DecisionAndReviews manuscript={version} />}
          {current && (
            <AdminSection key="decision-review">
              <DecisionReviews
                canHideReviews={canHideReviews}
                manuscript={version}
                reviewers={reviewers}
                sharedReviews={version.reviews}
                updateReview={updateReview}
                urlFrag={urlFrag}
              />
            </AdminSection>
          )}
          {current && (
            <AdminSection key="decision-form">
              <DecisionForm
                createFile={createFile}
                deleteFile={deleteFile}
                dirty={dirty}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isValid={isValid}
                manuscriptId={version.id}
                submitCount={submitCount}
                updateReview={updateReviewForVersion(version.id)}
              />
            </AdminSection>
          )}
          {current && (
            <AdminSection>
              <Publish
                manuscript={version}
                publishManuscript={publishManuscript}
              />
            </AdminSection>
          )}
        </>
      ),
      key: version.id,
      label: 'Workflow',
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
          sections={[
            decisionSection({ ...props }),
            editorSection,
            metadataSection({ ...props }),
          ]}
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
            identifier: PropTypes.string.isRequired,
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
