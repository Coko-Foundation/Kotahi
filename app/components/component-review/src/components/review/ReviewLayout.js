import React from 'react'
import PropTypes from 'prop-types'

import moment from 'moment'
import { Tabs } from '@pubsweet/ui'

import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'
import ReviewForm from './ReviewForm'
import ReviewMetadata from '../metadata/ReviewMetadata'
import Review from './Review'
import EditorSection from '../decision/EditorSection'
import { Columns, Manuscript, Chat } from '../../../../shared'
import MessageContainer from '../../../../component-chat/src'
import ArticleEvaluationSummaryPage from '../../../../component-decision-viewer'
import SharedReviewerGroupReviews from './SharedReviewerGroupReviews'

const Reviewerdisclaimer = styled.span`
  font-size: 14px;
  color: ${th('colorTextPlaceholder')};
  display: grid;
  place-items: center;
  padding: 0 5px;
`

const hasManuscriptFile = manuscript =>
  !!manuscript?.files?.find(file => file.fileType === 'manuscript')

const ReviewLayout = ({
  currentUser,
  versions,
  review,
  handleSubmit,
  isValid,
  status,
  updateReview,
  uploadFile,
  channelId,
  submissionForm,
}) => {
  const reviewSections = []
  const latestVersion = versions[0]
  const priorVersions = versions.slice(1)
  priorVersions.reverse() // Convert to chronological order (was reverse-chron)

  const decisionComment =
    latestVersion.reviews.find(
      reviewIsDecision => reviewIsDecision.isDecision,
    ) || {}

  const decisionRadio = latestVersion.status

  const formatDecisionComment = input => {
    const comment = input.decisionComment ? input.decisionComment.content : ''
    const placeholder = '"<i>The evaluation summary will appear here.</i>"'

    if (comment === '<p class="paragraph"></p>' || comment === '') {
      return placeholder
    }

    return comment
  }

  priorVersions.forEach(msVersion => {
    if (msVersion.reviews?.some(r => !r.user))
      console.error(
        `Malformed review objects in manuscript ${msVersion.id}:`,
        msVersion.reviews,
      )

    const label = moment().format('YYYY-MM-DD')
    reviewSections.push({
      content: (
        <div key={msVersion.id}>
          {hasManuscriptFile(msVersion) && (
            <EditorSection manuscript={msVersion} readonly />
          )}
          <ReviewMetadata
            form={submissionForm}
            manuscript={msVersion}
            showEditorOnlyFields={false}
          />
          <SharedReviewerGroupReviews
            manuscript={msVersion}
            reviewerId={currentUser.id}
          />
          <Review
            review={msVersion.reviews?.find(
              r => r.user?.id === currentUser.id && !r.isDecision,
            )}
          />
        </div>
      ),
      key: msVersion.id,
      label,
    })
  }, [])

  if (latestVersion.status !== 'revising') {
    const label = moment().format('YYYY-MM-DD')
    reviewSections.push({
      content: (
        <div key={latestVersion.id}>
          {hasManuscriptFile(latestVersion) && (
            <EditorSection manuscript={latestVersion} readonly />
          )}
          <Reviewerdisclaimer>
            By completing this review, you agree that you do not have any
            conflict of interests to declare. For any questions about what
            constitutes a conflict of interest, contact the administrator.
          </Reviewerdisclaimer>
          <ReviewMetadata
            form={submissionForm}
            manuscript={latestVersion}
            showEditorOnlyFields={false}
          />
          <SharedReviewerGroupReviews
            manuscript={latestVersion}
            reviewerId={currentUser.id}
          />
          {status === 'completed' ? (
            <Review review={review} />
          ) : (
            <ReviewForm
              handleSubmit={handleSubmit}
              isValid={isValid}
              manuscriptId={latestVersion.id}
              updateReview={updateReview}
              uploadFile={uploadFile}
            />
          )}
          {['colab'].includes(process.env.INSTANCE_NAME) && (
            <ArticleEvaluationSummaryPage
              decisionComment={formatDecisionComment(decisionComment)}
              decisionRadio={decisionRadio}
              updateReview={updateReview}
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
      reviews: PropTypes.arrayOf(
        PropTypes.shape({
          reviewComment: PropTypes.shape({
            content: PropTypes.string.isRequired,
            files: PropTypes.arrayOf(
              PropTypes.shape({
                filename: PropTypes.string.isRequired,
                url: PropTypes.string.isRequired,
              }).isRequired,
            ).isRequired,
          }),
          confidentialComment: PropTypes.shape({
            content: PropTypes.string.isRequired,
            files: PropTypes.arrayOf(
              PropTypes.shape({
                filename: PropTypes.string.isRequired,
                url: PropTypes.string.isRequired,
              }).isRequired,
            ).isRequired,
          }),
          recommendation: PropTypes.string,
        }),
      ),
      status: PropTypes.string.isRequired,
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
    }).isRequired,
  ).isRequired,
  review: PropTypes.shape({
    reviewComment: PropTypes.string,
    confidentialComment: PropTypes.string,
    recommendation: PropTypes.string,
  }),
  handleSubmit: PropTypes.func.isRequired,
  isValid: PropTypes.bool.isRequired,
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
  review: undefined,
  status: undefined,
  uploadFile: undefined,
}

export default ReviewLayout
