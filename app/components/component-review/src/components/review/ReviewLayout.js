import React from 'react'
import PropTypes from 'prop-types'

import moment from 'moment'
import { Tabs } from '@pubsweet/ui'

import ReviewForm from './ReviewForm'
import ReviewMetadata from '../metadata/ReviewMetadata'
import Review from './Review'
import EditorSection from '../decision/EditorSection'
import { Columns, Manuscript, Chat } from '../../../../shared'
import MessageContainer from '../../../../component-chat/src'
import ArticleEvaluationSummaryPage from '../../../../component-decision-viewer'

const addEditor = (manuscript, label) => ({
  content: <EditorSection manuscript={manuscript} readonly />,
  key: manuscript.id,
  label,
})

const hasManuscriptFile = manuscript =>
  !!manuscript?.files?.find(file => file.fileType === 'manuscript')

const ReviewLayout = ({
  currentUser,
  manuscript,
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
  const editorSections = []
  const manuscriptVersions = manuscript.manuscriptVersions || []

  const decisionComment =
    manuscript.reviews.find(reviewIsDecision => reviewIsDecision.isDecision) ||
    {}

  const decisionRadio = manuscript.status

  const formatDecisionComment = input => {
    const comment = input.decisionComment ? input.decisionComment.content : ''
    const placeholder = '"<i>The evaluation summary will appear here.</i>"'

    if (comment === '<p class="paragraph"></p>' || comment === '') {
      return placeholder
    }

    return comment
  }

  manuscriptVersions.forEach(msVersion => {
    const label = moment().format('YYYY-MM-DD')
    reviewSections.push({
      content: (
        <div>
          <ReviewMetadata
            form={submissionForm}
            manuscript={msVersion}
            showEditorOnlyFields={false}
          />
          <Review
            review={
              msVersion.reviews &&
              msVersion.reviews.find(
                r => r.user?.id === currentUser.id && !r.isDecision,
              )
            }
          />
        </div>
      ),
      key: msVersion.id,
      label,
    })

    if (hasManuscriptFile(msVersion))
      editorSections.push(addEditor(msVersion, label))
  }, [])

  if (manuscript.status !== 'revising') {
    const label = moment().format('YYYY-MM-DD')
    reviewSections.push({
      content: (
        <div>
          <ReviewMetadata
            form={submissionForm}
            manuscript={manuscript}
            showEditorOnlyFields={false}
          />
          {status === 'completed' ? (
            <Review review={review} />
          ) : (
            <ReviewForm
              handleSubmit={handleSubmit}
              isValid={isValid}
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
      key: manuscript.id,
      label,
    })

    if (hasManuscriptFile(manuscript))
      editorSections.push(addEditor(manuscript, label))
  }

  return (
    <Columns>
      <Manuscript>
        {editorSections.length > 0 && (
          <Tabs
            activeKey={editorSections[editorSections.length - 1].key}
            sections={editorSections}
            title="Versions"
          />
        )}

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
  manuscript: PropTypes.shape({
    id: PropTypes.string.isRequired,
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
    manuscriptVersions: PropTypes.arrayOf(
      PropTypes.shape({
        reviews: PropTypes.arrayOf(),
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
      }).isRequired,
    ),
  }).isRequired,
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
