import React, { useContext, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { set, debounce } from 'lodash'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import DecisionReviews from './decision/DecisionReviews'
import AssignEditorsReviewers from './assignEditors/AssignEditorsReviewers'
import AssignEditor from './assignEditors/AssignEditor'
import EmailNotifications from './emailNotifications'
import ReadonlyFormTemplate from './metadata/ReadonlyFormTemplate'
import EditorSection from './decision/EditorSection'
import Publish from './Publish'
import { AdminSection } from './style'
import {
  HiddenTabs,
  SectionContent,
  SectionHeader,
  SectionRow,
  Title,
} from '../../../shared'
import DecisionAndReviews from '../../../component-submit/src/components/DecisionAndReviews'
import FormTemplate from '../../../component-submit/src/components/FormTemplate'
import TaskList from '../../../component-task-manager/src/TaskList'
import KanbanBoard from './KanbanBoard'
import InviteReviewer from './reviewers/InviteReviewer'
import { ConfigContext } from '../../../config/src'
import { getActiveTab } from '../../../../shared/manuscriptUtils'

const TaskSectionRow = styled(SectionRow)`
  padding: 12px 0 18px;
`

const createBlankSubmissionBasedOnForm = form => {
  const allBlankedFields = {}
  const fieldNames = form?.children?.map(field => field.name)
  fieldNames.forEach(fieldName => set(allBlankedFields, fieldName, ''))
  return allBlankedFields.submission ?? {}
}

const DecisionVersion = ({
  allUsers,
  addReviewer,
  roles,
  decisionForm,
  form,
  currentDecisionData,
  currentUser,
  version,
  versionNumber,
  isCurrentVersion,
  parent,
  updateManuscript, // To handle manuscript editing
  onChange, // To handle form editing
  makeDecision,
  sendNotifyEmail,
  sendChannelMessage,
  publishManuscript,
  updateTeam,
  createTeam,
  updateReview,
  reviewForm,
  reviewers,
  teamLabels,
  canHideReviews,
  urlFrag,
  displayShortIdAsIdentifier,
  updateReviewJsonData,
  validateDoi,
  validateSuffix,
  createFile,
  deleteFile,
  threadedDiscussionProps,
  invitations,
  externalEmail,
  setExternalEmail,
  selectedEmail,
  setSelectedEmail,
  setShouldPublishField,
  selectedEmailIsBlacklisted,
  updateSharedStatusForInvitedReviewer,
  dois,
  refetch,
  updateTask,
  updateTasks,
  teams,
  removeReviewer,
  updateTeamMember,
  updateTaskNotification,
  deleteTaskNotification,
  createTaskEmailNotificationLog,
  manuscriptLatestVersionId,
  emailTemplates,
}) => {
  const config = useContext(ConfigContext)

  const threadedDiscussionExtendedProps = {
    ...threadedDiscussionProps,
    manuscriptLatestVersionId,
    selectedManuscriptVersionId: version.id,
  }

  const debouncedSave = useCallback(
    debounce(source => {
      updateManuscript(version.id, { meta: { source } })
    }, 2000),
    [],
  )

  const { t } = useTranslation()
  useEffect(() => debouncedSave.flush, [])
  const location = useLocation()

  const activeTab = React.useMemo(() => getActiveTab(location, 'tab'), [
    location,
  ])

  const addEditor = (manuscript, label, isCurrent, user) => {
    const isThisReadOnly = !isCurrent

    return {
      content: (
        <EditorSection
          currentUser={user}
          manuscript={manuscript}
          readonly={isThisReadOnly}
          saveSource={isThisReadOnly ? null : debouncedSave}
        />
      ),
      key: `editor`,
      label,
    }
  }

  const reviewOrInitial = manuscript =>
    manuscript?.reviews?.find(review => review.isDecision) || {
      isDecision: true,
    }

  // Find an existing review or create a placeholder, and hold a ref to it
  const existingReview = useRef(reviewOrInitial(version))

  // Update the value of that ref if the manuscript object changes
  useEffect(() => {
    existingReview.current = reviewOrInitial(version)
  }, [version.reviews])

  const editorSection = addEditor(
    version,
    t('decisionPage.Manuscript text'),
    isCurrentVersion,
    currentUser,
  )

  const metadataSection = () => {
    const submissionValues = isCurrentVersion
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
          {!isCurrentVersion ? (
            <ReadonlyFormTemplate
              displayShortIdAsIdentifier={displayShortIdAsIdentifier}
              form={form}
              formData={{
                ...version,
                submission: JSON.parse(version.submission),
              }}
              manuscript={version}
              showEditorOnlyFields
              threadedDiscussionProps={threadedDiscussionExtendedProps}
            />
          ) : (
            <SectionContent>
              <FormTemplate
                createFile={createFile}
                deleteFile={deleteFile}
                displayShortIdAsIdentifier={displayShortIdAsIdentifier}
                fieldsToPublish={
                  version.formFieldsToPublish.find(
                    ff => ff.objectId === version.id,
                  )?.fieldsToPublish ?? []
                }
                form={form}
                initialValues={versionValues}
                isSubmission
                manuscriptId={version.id}
                manuscriptShortId={version.shortId}
                manuscriptStatus={version.status}
                match={{ url: 'decision' }}
                onChange={(value, path) => {
                  onChange(value, path, versionId)
                }}
                republish={() => null}
                setShouldPublishField={async (fieldName, shouldPublish) =>
                  setShouldPublishField({
                    variables: {
                      manuscriptId: version.id,
                      objectId: version.id,
                      fieldName,
                      shouldPublish,
                    },
                  })
                }
                shouldShowOptionToPublish
                showEditorOnlyFields
                threadedDiscussionProps={threadedDiscussionExtendedProps}
                urlFrag={urlFrag}
                validateDoi={validateDoi}
                validateSuffix={validateSuffix}
              />
            </SectionContent>
          )}
        </>
      ),
      key: `metadata`,
      label: t('decisionPage.Metadata'),
    }
  }

  const tasksAndNotificationsSection = () => {
    return {
      content: (
        <>
          {isCurrentVersion &&
            ['journal', 'prc'].includes(config.instanceName) && (
              <EmailNotifications
                allUsers={allUsers}
                currentUser={currentUser}
                emailTemplates={emailTemplates}
                externalEmail={externalEmail}
                manuscript={version}
                selectedEmail={selectedEmail}
                selectedEmailIsBlacklisted={selectedEmailIsBlacklisted}
                sendChannelMessage={sendChannelMessage}
                sendNotifyEmail={sendNotifyEmail}
                setExternalEmail={setExternalEmail}
                setSelectedEmail={setSelectedEmail}
              />
            )}
          <SectionContent>
            <SectionHeader>
              <Title>{t('decisionPage.tasksTab.Tasks')}</Title>
            </SectionHeader>
            <TaskSectionRow>
              <TaskList
                createTaskEmailNotificationLog={createTaskEmailNotificationLog}
                currentUser={currentUser}
                deleteTaskNotification={deleteTaskNotification}
                emailTemplates={emailTemplates}
                manuscript={version}
                manuscriptId={parent.id}
                roles={roles}
                sendNotifyEmail={sendNotifyEmail}
                tasks={parent.tasks}
                updateTask={updateTask}
                updateTaskNotification={updateTaskNotification}
                updateTasks={updateTasks}
                users={allUsers}
              />
            </TaskSectionRow>
          </SectionContent>
        </>
      ),
      key: `tasks`,
      label: t('decisionPage.Tasks & Notifications'),
    }
  }

  const teamSection = () => {
    return {
      content: (
        <>
          {isCurrentVersion && (
            <AssignEditorsReviewers
              allUsers={allUsers}
              AssignEditor={AssignEditor}
              createTeam={createTeam}
              manuscript={version}
              teamLabels={teamLabels}
              updateTeam={updateTeam}
            />
          )}
          {!isCurrentVersion && (
            <SectionContent>
              <SectionHeader>
                <Title>Assigned editors</Title>
              </SectionHeader>
              <SectionRow>
                {version?.teams?.map(team => {
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
          <KanbanBoard
            invitations={invitations}
            isCurrentVersion={isCurrentVersion}
            manuscript={version}
            removeReviewer={removeReviewer}
            reviewForm={reviewForm}
            reviews={reviewers}
            updateReview={updateReview}
            updateSharedStatusForInvitedReviewer={
              updateSharedStatusForInvitedReviewer
            }
            updateTeamMember={updateTeamMember}
            version={version}
            versionNumber={versionNumber}
          />
          {isCurrentVersion && (
            <AdminSection>
              <InviteReviewer
                addReviewer={addReviewer}
                currentUser={currentUser}
                emailTemplates={emailTemplates}
                manuscript={version}
                reviewerUsers={allUsers}
                selectedEmailIsBlacklisted={selectedEmailIsBlacklisted}
                sendChannelMessage={sendChannelMessage}
                sendNotifyEmail={sendNotifyEmail}
                setExternalEmail={setExternalEmail}
                updateSharedStatusForInvitedReviewer={
                  updateSharedStatusForInvitedReviewer
                }
                updateTeamMember={updateTeamMember}
              />
            </AdminSection>
          )}
        </>
      ),
      key: `team`,
      label: t('decisionPage.Team'),
    }
  }

  const decisionSection = () => {
    return {
      content: (
        <>
          {!isCurrentVersion && (
            <SectionContent>
              <SectionHeader>
                <Title>{t('decisionPage.decisionTab.Archived version')}</Title>
              </SectionHeader>
              <SectionRow>
                {t('decisionPage.decisionTab.notCurrentVersion')}
              </SectionRow>
            </SectionContent>
          )}
          {!isCurrentVersion && (
            <DecisionAndReviews
              currentUser={currentUser}
              decisionForm={decisionForm}
              isControlPage
              manuscript={version}
              readOnly
              reviewForm={reviewForm}
              showEditorOnlyFields
              threadedDiscussionProps={threadedDiscussionExtendedProps}
            />
          )}
          {isCurrentVersion && (
            <DecisionReviews
              canHideReviews={canHideReviews}
              currentUser={currentUser}
              invitations={invitations}
              manuscript={version}
              reviewers={reviewers}
              reviewForm={reviewForm}
              threadedDiscussionProps={threadedDiscussionExtendedProps}
              updateReview={updateReview}
              updateSharedStatusForInvitedReviewer={
                updateSharedStatusForInvitedReviewer
              }
              updateTeamMember={updateTeamMember}
              urlFrag={urlFrag}
            />
          )}
          {isCurrentVersion && (
            <AdminSection key="decision-form">
              <SectionContent>
                <FormTemplate
                  createFile={createFile}
                  deleteFile={deleteFile}
                  fieldsToPublish={
                    version.formFieldsToPublish.find(
                      ff => ff.objectId === currentDecisionData.id,
                    )?.fieldsToPublish ?? []
                  }
                  form={decisionForm}
                  initialValues={
                    currentDecisionData?.jsonData
                      ? JSON.parse(currentDecisionData?.jsonData)
                      : { comment: '', verdict: '', discussion: '' } // TODO this should just be {}, but needs testing.
                  }
                  isSubmission={false}
                  manuscriptId={version.id}
                  manuscriptShortId={version.shortId}
                  manuscriptStatus={version.status}
                  onChange={updateReviewJsonData}
                  onSubmit={async (values, actions) => {
                    await makeDecision({
                      variables: {
                        id: version.id,
                        decision: values.verdict,
                      },
                    })
                    actions.setSubmitting(false)
                  }}
                  reviewId={currentDecisionData.id}
                  setShouldPublishField={async (fieldName, shouldPublish) =>
                    setShouldPublishField({
                      variables: {
                        manuscriptId: version.id,
                        objectId: currentDecisionData.id,
                        fieldName,
                        shouldPublish,
                      },
                    })
                  }
                  shouldShowOptionToPublish
                  shouldStoreFilesInForm
                  showEditorOnlyFields
                  submissionButtonText={t('decisionPage.decisionTab.Submit')}
                  tagForFiles="decision"
                  threadedDiscussionProps={threadedDiscussionExtendedProps}
                  urlFrag={urlFrag}
                  validateDoi={validateDoi}
                  validateSuffix={validateSuffix}
                />
              </SectionContent>
            </AdminSection>
          )}
          {isCurrentVersion && (
            <AdminSection>
              <Publish
                dois={dois}
                manuscript={version}
                publishManuscript={publishManuscript}
              />
            </AdminSection>
          )}
        </>
      ),
      key: `decision`,
      label: t('decisionPage.Decision'),
    }
  }

  let defaultActiveKey

  switch (config?.controlPanel?.showTabs[0]) {
    case 'Team':
      defaultActiveKey = `team`
      break
    case 'Decision':
      defaultActiveKey = `decision`
      break
    case 'Manuscript text':
      defaultActiveKey = `editor`
      break
    case 'Metadata':
      defaultActiveKey = `metadata`
      break
    case 'Tasks & Notifications':
      defaultActiveKey = `tasks`
      break
    default:
      defaultActiveKey = `team`
      break
  }

  let locationState =
    location.state !== undefined && location.state.tab === 'Decision'
      ? `decision`
      : defaultActiveKey

  if (activeTab) locationState = activeTab

  const sections = []

  if (config?.controlPanel?.showTabs) {
    if (config?.controlPanel?.showTabs.includes('Team'))
      sections.push(teamSection())
    if (config?.controlPanel?.showTabs.includes('Decision'))
      sections.push(decisionSection())
    if (config?.controlPanel?.showTabs.includes('Manuscript text'))
      sections.push(editorSection)
    if (config?.controlPanel?.showTabs.includes('Metadata'))
      sections.push(metadataSection())
    if (config?.controlPanel?.showTabs.includes('Tasks & Notifications'))
      sections.push(tasksAndNotificationsSection())
  }

  return (
    <HiddenTabs
      defaultActiveKey={locationState}
      onChange={refetch}
      sections={sections}
    />
  )
}

DecisionVersion.propTypes = {
  addReviewer: PropTypes.func.isRequired,
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
  isCurrentVersion: PropTypes.bool.isRequired,
  version: PropTypes.shape({
    id: PropTypes.string.isRequired,
    meta: PropTypes.shape({}).isRequired,
    files: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        storedObjects: PropTypes.arrayOf(PropTypes.object.isRequired),
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
      }).isRequired,
    ).isRequired,
  }).isRequired,
  versionNumber: PropTypes.number.isRequired,
  parent: PropTypes.shape({
    id: PropTypes.string.isRequired,
    teams: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        members: PropTypes.arrayOf(
          PropTypes.shape({
            user: PropTypes.shape({
              id: PropTypes.string.isRequired,
              username: PropTypes.string.isRequired,
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
