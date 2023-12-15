import React, { useContext } from 'react'
import PropTypes from 'prop-types'

import moment from 'moment'
import { Tabs } from '@pubsweet/ui'

import { useTranslation } from 'react-i18next'
import ReadonlyFormTemplate from '../metadata/ReadonlyFormTemplate'
import Review from './Review'
import EditorSection from '../decision/EditorSection'
import { Columns, Manuscript, Chat, SectionContent } from '../../../../shared'
import { ChatButton, CollapseButton } from '../style'
import MessageContainer from '../../../../component-chat/src/MessageContainer'
import SharedReviewerGroupReviews from './SharedReviewerGroupReviews'
import FormTemplate from '../../../../component-submit/src/components/FormTemplate'
import { ConfigContext } from '../../../../config/src'

const hasManuscriptFile = manuscript =>
  !!manuscript?.files?.find(file => file.tags.includes('manuscript'))

const ReviewLayout = ({
  currentUser,
  versions,
  review,
  reviewForm,
  onSubmit,
  // isValid,
  status,
  channels,
  updateReview,
  updateReviewJsonData,
  uploadFile,
  channelId,
  submissionForm,
  createFile,
  deleteFile,
  manuscript,
  validateDoi,
  validateSuffix,
  decisionForm,
  threadedDiscussionProps,
  chatProps,
}) => {
  const config = useContext(ConfigContext)
  const reviewSections = []
  const latestVersion = versions[0]
  const priorVersions = versions.slice(1)
  priorVersions.reverse() // Convert to chronological order (was reverse-chron)

  const decision = latestVersion.reviews.find(r => r.isDecision) || {}
  const { t } = useTranslation()

  const channelData = chatProps?.channelsData?.find(
    channel => channel?.channelId === channelId,
  )

  const decisionIsComplete = [
    'accepted',
    'revise',
    'rejected',
    'evaluated',
    'published',
  ].includes(latestVersion.status)

  const redactedDecisionForm = decisionIsComplete
    ? decisionForm
    : {
        ...decisionForm,
        children: decisionForm.children.filter(
          x => x.component === 'ThreadedDiscussion',
        ),
      }

  priorVersions.forEach(msVersion => {
    if (msVersion.reviews?.some(r => !r.user))
      console.error(
        `Malformed review objects in manuscript ${msVersion.id}:`,
        msVersion.reviews,
      )

    const reviewForCurrentUser = msVersion.reviews?.find(
      r => r.user?.id === currentUser.id && !r.isDecision,
    )

    const reviewData = reviewForCurrentUser?.jsonData || {}

    const label = moment().format('YYYY-MM-DD')
    reviewSections.push({
      content: (
        <div key={msVersion.id}>
          {hasManuscriptFile(msVersion) && (
            <EditorSection
              currentUser={currentUser}
              manuscript={msVersion}
              readonly
            />
          )}
          <ReadonlyFormTemplate
            form={submissionForm}
            formData={reviewData}
            manuscript={msVersion}
            showEditorOnlyFields={false}
            threadedDiscussionProps={threadedDiscussionProps}
          />
          <SharedReviewerGroupReviews
            manuscript={msVersion}
            reviewerId={currentUser.id}
            reviewForm={reviewForm}
            threadedDiscussionsProps={threadedDiscussionProps}
          />
          <Review
            review={reviewForCurrentUser}
            reviewForm={reviewForm}
            threadedDiscussionProps={threadedDiscussionProps}
          />
        </div>
      ),
      key: msVersion.id,
      label,
    })
  }, [])

  if (latestVersion.status !== 'revising') {
    const reviewForCurrentUser = latestVersion.reviews?.find(
      r => r.user?.id === currentUser.id && !r.isDecision,
    )

    const reviewData = reviewForCurrentUser?.jsonData || {}

    const label = moment().format('YYYY-MM-DD')

    reviewSections.push({
      content: (
        <div key={latestVersion.id}>
          {hasManuscriptFile(latestVersion) && (
            <EditorSection
              currentUser={currentUser}
              manuscript={latestVersion}
              readonly
            />
          )}
          <ReadonlyFormTemplate // Display manuscript metadata
            form={submissionForm}
            formData={latestVersion}
            manuscript={latestVersion}
            showEditorOnlyFields={false}
            threadedDiscussionProps={threadedDiscussionProps}
          />
          <SharedReviewerGroupReviews
            manuscript={latestVersion}
            reviewerId={currentUser.id}
            reviewForm={reviewForm}
            threadedDiscussionProps={threadedDiscussionProps}
          />
          {status === 'completed' ? (
            <Review
              review={review}
              reviewForm={reviewForm}
              threadedDiscussionProps={threadedDiscussionProps}
            />
          ) : (
            <SectionContent>
              <FormTemplate
                createFile={createFile}
                deleteFile={deleteFile}
                form={reviewForm}
                initialValues={reviewData}
                manuscriptId={latestVersion.id}
                manuscriptShortId={latestVersion.shortId}
                manuscriptStatus={latestVersion.status}
                onChange={updateReviewJsonData}
                onSubmit={onSubmit}
                shouldStoreFilesInForm
                showEditorOnlyFields={false}
                submissionButtonText={t('reviewPage.Submit')}
                tagForFiles="review"
                threadedDiscussionProps={threadedDiscussionProps}
                validateDoi={validateDoi}
                validateSuffix={validateSuffix}
              />
            </SectionContent>
          )}
          {config?.review?.showSummary && (
            <ReadonlyFormTemplate
              form={redactedDecisionForm}
              formData={decision.jsonData || {}}
              hideSpecialInstructions
              manuscript={latestVersion}
              threadedDiscussionProps={threadedDiscussionProps}
              title={decisionForm.name}
            />
          )}
        </div>
      ),
      key: latestVersion.id,
      label,
    })
  }

  const [isDiscussionVisible, setIsDiscussionVisible] = React.useState(false)

  const toggleSubmissionDiscussionVisibility = async () => {
    try {
      const { channelsData } = chatProps || {}

      const dataRefetchPromises = channelsData?.map(async channel => {
        await channel?.refetchUnreadMessagesCount?.()
        await channel?.refetchNotificationOptionData?.()
      })

      await Promise.all(dataRefetchPromises)

      setIsDiscussionVisible(prevState => !prevState)
    } catch (error) {
      console.error('Error toggling submission discussion visibility:', error)
    }
  }

  return (
    <Columns>
      <Manuscript>
        <Tabs
          activeKey={reviewSections[reviewSections.length - 1].key}
          sections={reviewSections}
          title={t('reviewPage.Versions')}
        />
      </Manuscript>
      {isDiscussionVisible && (
        <Chat>
          <MessageContainer
            channelId={channelId}
            channels={channels}
            chatProps={chatProps}
            currentUser={currentUser}
          />
          <CollapseButton
            iconName="ChevronRight"
            onClick={toggleSubmissionDiscussionVisibility}
            title={t('chat.Hide Chat')}
          />
        </Chat>
      )}
      {!isDiscussionVisible && (
        <ChatButton
          iconName="MessageSquare"
          onClick={toggleSubmissionDiscussionVisibility}
          title={t('chat.Show Chat')}
          unreadMessagesCount={channelData?.unreadMessagesCount}
        />
      )}
    </Columns>
  )
}

ReviewLayout.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  versions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      reviews: PropTypes.arrayOf(PropTypes.shape({})),
      status: PropTypes.string.isRequired,
      meta: PropTypes.shape({ source: PropTypes.string }).isRequired,
      files: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          storedObjects: PropTypes.arrayOf(PropTypes.object.isRequired),
        }).isRequired,
      ).isRequired,
    }).isRequired,
  ).isRequired,
  review: PropTypes.shape({}),
  onSubmit: PropTypes.func,
  status: PropTypes.string,
  updateReview: PropTypes.func.isRequired,
  uploadFile: PropTypes.func,
  channelId: PropTypes.string.isRequired,
  submissionForm: PropTypes.shape({
    children: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        title: PropTypes.string,
        shortDescription: PropTypes.string,
      }).isRequired,
    ).isRequired,
  }).isRequired,
}

ReviewLayout.defaultProps = {
  onSubmit: () => {},
  review: undefined,
  status: undefined,
  uploadFile: undefined,
}

export default ReviewLayout
