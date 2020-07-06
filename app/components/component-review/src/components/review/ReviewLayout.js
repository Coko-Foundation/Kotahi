import React from 'react'

import moment from 'moment'
import { Tabs } from '@pubsweet/ui'

import ReviewForm from './ReviewForm'
import ReviewMetadata from '../metadata/ReviewMetadata'
import Review from './Review'
import EditorSection from '../decision/EditorSection'
import { Columns, Manuscript, Chat } from '../style'
import MessageContainer from '../../../../component-chat/src'

const addEditor = (manuscript, label) => ({
  content: <EditorSection manuscript={manuscript} />,
  key: manuscript.id,
  label,
})

const ReviewLayout = ({
  currentUser,
  manuscript,
  review,
  reviewer,
  handleSubmit,
  isValid,
  status,
  updateReview,
  uploadFile,
  channelId,
}) => {
  const reviewSections = []
  const editorSections = []
  const manuscriptVersions = manuscript.manuscriptVersions || []

  manuscriptVersions.forEach(manuscript => {
    const label = moment().format('YYYY-MM-DD')
    reviewSections.push({
      content: (
        <div>
          <ReviewMetadata manuscript={manuscript} />
          <Review
            review={
              manuscript.reviews &&
              manuscript.reviews.find(
                review =>
                  (review.user.id === currentUser.id && !review.isDecision) ||
                  {},
              )
            }
          />
        </div>
      ),
      key: manuscript.id,
      label,
    })

    editorSections.push(addEditor(manuscript, label))
  }, [])

  if (manuscript.status !== 'revising') {
    const label = moment().format('YYYY-MM-DD')
    reviewSections.push({
      content: (
        <div>
          <ReviewMetadata manuscript={manuscript} />
          {status === 'completed' ? (
            <Review review={review} />
          ) : (
            <ReviewForm
              handleSubmit={handleSubmit}
              isValid={isValid}
              review={review}
              updateReview={updateReview}
              uploadFile={uploadFile}
            />
          )}
        </div>
      ),
      key: manuscript.id,
      label,
    })

    editorSections.push(addEditor(manuscript, label))
  }
  return (
    <Columns>
      <Manuscript>
        {/* <Manuscript>
        <Tabs
          activeKey={editorSections[editorSections.length - 1].key}
          sections={editorSections}
          title="Versions"
        />
      </Manuscript> */}

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

export default ReviewLayout
