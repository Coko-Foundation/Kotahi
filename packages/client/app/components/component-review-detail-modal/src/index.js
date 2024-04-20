import React, { useState, useContext } from 'react'
import styled from 'styled-components'
import { get } from 'lodash'
import { Checkbox } from '@pubsweet/ui/dist/atoms'
import { useTranslation } from 'react-i18next'
import { convertTimestampToDateString } from '../../../shared/dateUtils'
import { ensureJsonIsParsed } from '../../../shared/objectUtils'
import Modal, { SecondaryButton } from '../../component-modal/src/Modal'
import {
  ConfigurableStatus,
  UserInfo,
  UserCombo,
  Primary,
  Secondary,
} from '../../shared'
import reviewStatuses from '../../../../config/journal/review-status'
import recommendations from '../../../../config/journal/recommendations'
import { UserAvatar } from '../../component-avatar/src'
import DeleteReviewerModal from '../../component-review/src/components/reviewers/DeleteReviewerModal'
import ReadonlyFieldData from '../../component-review/src/components/metadata/ReadonlyFieldData'
import FormTemplate from '../../component-submit/src/components/FormTemplate'
import { ConfigContext } from '../../config/src'
import localizeReviewFilterOptions from '../../../shared/localizeReviewFilterOptions'
import localizeRecommendations from '../../../shared/localizeRecommendations'

const Header = styled.div`
  font-size: 18px;
  font-weight: 500;
`

const ReviewItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 14px;
  gap: 0.8em;
`

const ReviewItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1em;
  margin-top: 1.5em;

  .ProseMirror {
    background: none;
  }
`

const StatusContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 1.5em;
`

const ReviewDetailsModal = (
  props, // main title in black
) => {
  const {
    createFile,
    currentUser,
    deleteFile,
    status,
    canEditReviews,
    review,
    reviewerTeamMember,
    reviewForm,
    onClose,
    threadedDiscussionProps,
    showEditorOnlyFields,
    isOpen,
    isControlPage = true,
    readOnly = false,
    removeReviewer,
    manuscriptId,
    manuscriptShortId,
    isInvitation = false,
    updateSharedStatusForInvitedReviewer,
    updateTeamMember,
    updateCollaborativeTeamMember,
    updateReview,
    updateReviewJsonData,
  } = props

  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const LocalizedReviewFilterOptions = localizeReviewFilterOptions(
    reviewStatuses,
    t,
  )

  let statusConfig = null

  // when the review is collaborative the status is not completed but closed
  if (review?.isCollaborative && review?.isLock === true) {
    statusConfig = {
      color: '#eeeeee',
      label: 'Closed',
      value: 'closed',
      lightText: false,
    }
  } else {
    statusConfig = LocalizedReviewFilterOptions.find(
      item => item.value === (status ?? 'completed'),
    )
  }

  let reviewer = null

  if (review?.isCollaborative) {
    reviewer = reviewerTeamMember?.user
  } else if (review) {
    reviewer = review.user
  } else {
    reviewer = reviewerTeamMember?.user
  }

  const showRealReviewer = !review?.isHiddenReviewerName || isControlPage

  const reviewerName = showRealReviewer
    ? reviewer?.username || reviewerTeamMember?.invitedPersonName
    : 'Anonymous Reviewer'

  const generateModalTitle = () => {
    if (!showRealReviewer || !reviewer) {
      return t('modals.reviewReport.anonymousReviewReport')
    }

    if (review?.isCollaborative) {
      return t('modals.reviewReport.collaborativeReview', {
        name: reviewerName,
      })
    }

    return t('modals.reviewReport.reviewReport', {
      name: reviewerName,
    })
  }

  const timeString = convertTimestampToDateString(
    review ? review.updated : reviewerTeamMember.updated,
  )

  const reviewData = review ? ensureJsonIsParsed(review?.jsonData) : {}

  return (
    <Modal
      contentStyles={{ width: '70%' }}
      isOpen={isOpen}
      leftActions={
        !readOnly && (
          <CheckboxActions
            isInvitation={isInvitation}
            manuscriptId={manuscriptId}
            review={review}
            reviewerTeamMember={reviewerTeamMember}
            updateCollaborativeTeamMember={updateCollaborativeTeamMember}
            updateReview={updateReview}
            updateSharedStatusForInvitedReviewer={
              updateSharedStatusForInvitedReviewer
            }
            updateTeamMember={updateTeamMember}
          />
        )
      }
      onClose={onClose}
      rightActions={
        !readOnly &&
        !isInvitation && (
          <>
            <SecondaryButton onClick={() => setOpen(true)}>
              {t('modals.reviewReport.Delete')}
            </SecondaryButton>
            <DeleteReviewerModal
              isOpen={open}
              manuscriptId={manuscriptId}
              onClose={() => setOpen(false)}
              removeReviewer={removeReviewer}
              reviewer={reviewerTeamMember}
            />
          </>
        )
      }
      subtitle={t(`modals.reviewReport.Last Updated`, {
        dateString: timeString,
      })}
      title={generateModalTitle()}
    >
      {reviewer && (
        <UserCombo style={{ marginBottom: '1em' }}>
          <UserAvatar
            isClickable
            showHoverProfile
            size="48"
            user={showRealReviewer ? reviewer : null}
          />
          <UserInfo>
            <p>
              <Primary>{t('modals.reviewReport.Reviewer')} </Primary>{' '}
              {reviewerName}
            </p>
            {showRealReviewer && (
              <Secondary>
                {reviewer?.defaultIdentity?.identifier ??
                  reviewerTeamMember.toEmail}
              </Secondary>
            )}
          </UserInfo>
        </UserCombo>
      )}
      <StatusContainer>
        <Header>{t('modals.reviewReport.Status')}</Header>
        <ConfigurableStatus
          color={statusConfig?.color}
          lightText={statusConfig?.lightText}
        >
          {statusConfig?.label}
        </ConfigurableStatus>
      </StatusContainer>
      {review ? (
        <>
          {(review.isCollaborative === false || review.isLock === true) && (
            <ReviewData
              canEditReviews={canEditReviews}
              createFile={createFile}
              deleteFile={deleteFile}
              manuscriptId={manuscriptId}
              readOnly={readOnly}
              review={review}
              reviewForm={reviewForm}
              showEditorOnlyFields={showEditorOnlyFields}
              threadedDiscussionProps={threadedDiscussionProps}
              updateReview={updateReview}
            />
          )}
          {review.isCollaborative === true && !review.isLock && (
            <FormTemplate
              collaborativeObject={{ identifier: review.id, currentUser }}
              createFile={createFile}
              deleteFile={deleteFile}
              form={reviewForm}
              formikOptions={{ enableReinitialize: true }}
              initialValues={reviewData}
              isCollaborative={review.isCollaborative}
              manuscriptId={manuscriptId}
              manuscriptShortId={manuscriptShortId}
              onChange={(value, path) =>
                updateReviewJsonData(
                  review.id,
                  value,
                  path,
                  false,
                  manuscriptId,
                )
              }
              shouldStoreFilesInForm
              showEditorOnlyFields={false}
              submissionButtonText={t('reviewPage.Submit')}
              tagForFiles="review"
              threadedDiscussionProps={threadedDiscussionProps}
            />
          )}
        </>
      ) : (
        <ReviewItemsContainer>
          <i>{t('modals.reviewReport.reviewNotCompleted')}</i>
        </ReviewItemsContainer>
      )}
    </Modal>
  )
}

const CheckboxActions = ({
  review,
  reviewerTeamMember,
  updateSharedStatusForInvitedReviewer,
  updateTeamMember,
  updateCollaborativeTeamMember,
  isInvitation,
  manuscriptId,
  updateReview,
}) => {
  const config = useContext(ConfigContext)
  const { t } = useTranslation()

  const toggleSharedStatus = async () => {
    if (isInvitation) {
      await updateSharedStatusForInvitedReviewer({
        variables: {
          invitationId: reviewerTeamMember.id,
          isShared: !reviewerTeamMember.isShared,
        },
      })
    } else if (review.isCollaborative) {
      await updateCollaborativeTeamMember({
        variables: {
          manuscriptId,
          input: JSON.stringify({ isShared: !reviewerTeamMember.isShared }),
        },
      })
    } else {
      await updateTeamMember({
        variables: {
          id: reviewerTeamMember.id,
          input: JSON.stringify({ isShared: !reviewerTeamMember.isShared }),
        },
      })
    }
  }

  const toggleIsHiddenFromAuthor = () => {
    updateReview(
      review?.id,
      {
        isHiddenFromAuthor: !review?.isHiddenFromAuthor,
        manuscriptId,
      },
      manuscriptId,
    )
  }

  const toggleIsHiddenReviewerNameFromPublishedAndAuthor = () => {
    updateReview(
      review?.id,
      {
        isHiddenReviewerName: !review?.isHiddenReviewerName,
        manuscriptId,
      },
      manuscriptId,
    )
  }

  return (
    <>
      {review && config.controlPanel?.hideReview && (
        <>
          <Checkbox
            checked={
              review.isHiddenFromAuthor || review.isHiddenFromAuthor == null
            }
            label={t('modals.reviewReport.Hide Review')}
            onChange={toggleIsHiddenFromAuthor}
          />
          <Checkbox
            checked={
              review.isHiddenReviewerName || review.isHiddenReviewerName == null
            }
            label={t('modals.reviewReport.Hide Reviewer Name')}
            onChange={toggleIsHiddenReviewerNameFromPublishedAndAuthor}
          />
        </>
      )}
      {config.controlPanel?.sharedReview && (
        <Checkbox
          checked={reviewerTeamMember?.isShared}
          label={t('modals.reviewReport.Shared')}
          onChange={toggleSharedStatus}
        />
      )}
    </>
  )
}

const ReviewData = ({
  canEditReviews,
  manuscriptId,
  updateReview,
  readOnly,
  createFile,
  deleteFile,
  review,
  reviewForm,
  threadedDiscussionProps,
  showEditorOnlyFields,
}) => {
  const reviewFormData = ensureJsonIsParsed(review.jsonData) ?? {}
  const { t } = useTranslation()
  const localizedRecommendations = localizeRecommendations(recommendations, t)

  const recommendationConfig = localizedRecommendations.find(
    item => item.value === get(reviewFormData, '$verdict'),
  )

  const isViewable = element =>
    (showEditorOnlyFields || element.hideFromAuthors !== 'true') &&
    element.hideFromReviewers !== 'true' &&
    element.name !== '$verdict'

  const isFileField = element =>
    ['SupplementaryFiles', 'VisualAbstract'].includes(element.component)

  const nonFileFields = reviewForm.children.filter(
    element => isViewable(element) && !isFileField(element),
  )

  const fileFields = reviewForm.children.filter(
    element => isViewable(element) && isFileField(element),
  )

  return (
    <>
      {recommendationConfig && (
        <StatusContainer>
          <Header>{t('modals.reviewReport.Recommendation')}</Header>
          <ConfigurableStatus color={recommendationConfig.color} lightText>
            {recommendationConfig.label}
          </ConfigurableStatus>
        </StatusContainer>
      )}

      {!readOnly && canEditReviews ? (
        <FormTemplate
          createFile={createFile}
          deleteFile={deleteFile}
          form={{ ...reviewForm, name: null, description: null }} // suppresses the form title and description
          formData={reviewFormData}
          initialValues={reviewFormData}
          manuscriptId={manuscriptId}
          noHeader
          noPadding
          onChange={(value, path) => {
            updateReview(
              review.id,
              {
                jsonData: JSON.stringify({ [path]: value }),
                manuscriptId,
              },
              manuscriptId,
            )
          }}
          shouldStoreFilesInForm
          showEditorOnlyFields={false}
          tagForFiles="review"
          threadedDiscussionProps={threadedDiscussionProps}
        />
      ) : (
        <ReviewItemsContainer>
          {[...nonFileFields, ...fileFields].map((element, i) => (
            <ReviewItemContainer key={element.id}>
              <Header>{element.shortDescription || element.title}</Header>
              <ReadonlyFieldData
                fieldName={element.name}
                form={reviewForm}
                formData={reviewFormData}
                isCollaborativeForm={review.isCollaborative}
                threadedDiscussionProps={threadedDiscussionProps}
              />
            </ReviewItemContainer>
          ))}
        </ReviewItemsContainer>
      )}
    </>
  )
}

export default ReviewDetailsModal
