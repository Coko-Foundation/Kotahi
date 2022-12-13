import React from 'react'
import PropTypes from 'prop-types'

import moment from 'moment'
import { Tabs } from '@pubsweet/ui'

import ReadonlyFormTemplate from '../metadata/ReadonlyFormTemplate'
import Review from './Review'
import EditorSection from '../decision/EditorSection'
import { Columns, Manuscript, Chat, SectionContent } from '../../../../shared'
import MessageContainer from '../../../../component-chat/src/MessageContainer'
import SharedReviewerGroupReviews from './SharedReviewerGroupReviews'
import FormTemplate from '../../../../component-submit/src/components/FormTemplate'

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
  updateReview,
  updateReviewJsonData,
  uploadFile,
  channelId,
  submissionForm,
  createFile,
  deleteFile,
  validateDoi,
  validateSuffix,
  decisionForm,
  threadedDiscussionProps,
}) => {
  const reviewSections = []
  const latestVersion = versions[0]
  const priorVersions = versions.slice(1)
  priorVersions.reverse() // Convert to chronological order (was reverse-chron)

  const decision = latestVersion.reviews.find(r => r.isDecision) || {}

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
            <EditorSection manuscript={msVersion} readonly />
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
            <EditorSection manuscript={latestVersion} readonly />
          )}
          <ReadonlyFormTemplate // Display manuscript metadata
            form={submissionForm}
            formData={{
              ...latestVersion,
              submission: JSON.parse(latestVersion.submission),
            }}
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
                submissionButtonText="Submit"
                tagForFiles="review"
                threadedDiscussionProps={threadedDiscussionProps}
                validateDoi={validateDoi}
                validateSuffix={validateSuffix}
              />
            </SectionContent>
          )}
          {['colab'].includes(process.env.INSTANCE_NAME) && (
            <ReadonlyFormTemplate
              form={decisionForm}
              formData={decision.jsonData || {}}
              hideSpecialInstructions
              manuscript={latestVersion}
              threadedDiscussionProps={threadedDiscussionProps}
              title="Evaluation summary"
            />
          )}
        </div>
      ),
      key: latestVersion.id,
      label,
    })
  }

  return (
    <Columns>
      <Manuscript>
        <Tabs
          activeKey={reviewSections[reviewSections.length - 1].key}
          sections={reviewSections}
          title="Versions"
        />
      </Manuscript>
      <Chat>
        <MessageContainer channelId={channelId} />
      </Chat>
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
      meta: PropTypes.shape({}).isRequired,
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
