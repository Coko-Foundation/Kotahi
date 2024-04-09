import React, { useState, useContext } from 'react'
import { gql, useMutation } from '@apollo/client'
import styled from 'styled-components'
import { get } from 'lodash'
import { Checkbox } from '@pubsweet/ui/dist/atoms'
import { useTranslation } from 'react-i18next'
import { Formik } from 'formik'
import { convertTimestampToDateString } from '../../../shared/dateUtils'
import { ensureJsonIsParsed } from '../../../shared/objectUtils'
import Modal, { SecondaryButton } from '../../component-modal/src/Modal'
import {
  ConfigurableStatus,
  FilesUpload,
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
import { ConfigContext } from '../../config/src'
import localizeReviewFilterOptions from '../../../shared/localizeReviewFilterOptions'
import localizeRecommendations from '../../../shared/localizeRecommendations'
import SimpleWaxEditor from '../../wax-collab/src/SimpleWaxEditor'

const createFileMutation = gql`
  mutation ($file: Upload!, $meta: FileMetaInput!) {
    createFile(file: $file, meta: $meta) {
      id
      created
      name
      updated
      name
      tags
      objectId
      storedObjects {
        key
        mimetype
        url
      }
    }
  }
`

const deleteFileMutation = gql`
  mutation ($id: ID!) {
    deleteFile(id: $id)
  }
`

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
    status,
    canEditReviews,
    review,
    reviewerTeamMember,
    refetchManuscript,
    reviewForm,
    onClose,
    threadedDiscussionProps,
    showEditorOnlyFields,
    isOpen,
    isControlPage = true,
    readOnly = false,
    removeReviewer,
    manuscriptId,
    isInvitation = false,
    updateSharedStatusForInvitedReviewer,
    updateTeamMember,
    updateReview,
  } = props

  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const [createFile] = useMutation(createFileMutation)

  const handleFileChange = (files, property) => {
    const cleanData = files.map(file => {
      if (typeof file === 'object' && file !== null) {
        return file.id
      }

      return file
    })

    const currentData = JSON.parse(review.jsonData)
    currentData[property] = cleanData
    updateReview(
      review.id,
      {
        jsonData: JSON.stringify(currentData),
        manuscriptId,
      },
      manuscriptId,
    )
  }

  const [deleteFile] = useMutation(deleteFileMutation, {
    update(cache, { data: { deleteFile: fileToDelete } }) {
      const id = cache.identify({
        __typename: 'File',
        id: fileToDelete,
      })

      cache.evict({ id })
    },
    onCompleted: () => refetchManuscript(),
  })

  const LocalizedReviewFilterOptions = localizeReviewFilterOptions(
    reviewStatuses,
    t,
  )

  const statusConfig = LocalizedReviewFilterOptions.find(
    item => item.value === (status ?? 'completed'),
  )

  const reviewer = review ? review.user : reviewerTeamMember.user
  const showRealReviewer = !review?.isHiddenReviewerName || isControlPage

  const reviewerName = showRealReviewer
    ? `${reviewer?.username ?? reviewerTeamMember?.invitedPersonName}`
    : 'Anonymous Reviewer'

  const timeString = convertTimestampToDateString(
    review ? review.updated : reviewerTeamMember.updated,
  )

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
      title={
        reviewerName
          ? t('modals.reviewReport.reviewReport', { name: reviewerName })
          : t('modals.reviewReport.anonymousReviewReport')
      }
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
              {`${reviewerName}`}
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
          color={statusConfig.color}
          lightText={statusConfig.lightText}
        >
          {statusConfig.label}
        </ConfigurableStatus>
      </StatusContainer>
      {review ? (
        <ReviewData
          canEditReviews={canEditReviews}
          createFile={createFile}
          deleteFile={deleteFile}
          handleFileChange={handleFileChange}
          manuscriptId={manuscriptId}
          readOnly={readOnly}
          review={review}
          reviewForm={reviewForm}
          showEditorOnlyFields={showEditorOnlyFields}
          threadedDiscussionProps={threadedDiscussionProps}
          updateReview={updateReview}
        />
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
  handleFileChange,
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

  const onBlurHandler = (key, value) => {
    updateReview(
      review.id,
      {
        jsonData: JSON.stringify({ [key]: value }),
        manuscriptId,
      },
      manuscriptId,
    )
  }

  const fieldRenderer = element => {
    if (element.component === 'AbstractEditor' && !readOnly && canEditReviews) {
      return (
        <SimpleWaxEditor
          onChange={value => onBlurHandler(element.name, value)}
          value={reviewFormData[element.name]}
        />
      )
    }

    if (
      element.component === 'SupplementaryFiles' &&
      !readOnly &&
      canEditReviews
    ) {
      return (
        <Formik
          initialValues={{ [element.name]: reviewFormData[element.name] }}
          onSubmit={actions => {
            actions.setSubmitting(false)
          }}
        >
          <FilesUpload
            acceptMultiple
            confirmBeforeDelete
            createFile={createFile}
            deleteFile={deleteFile}
            fieldName={element.name}
            fileType="review"
            manuscriptId={manuscriptId}
            onChange={handleFileChange}
            reviewId={review.id}
            values={reviewFormData}
          />
        </Formik>
      )
    }

    return (
      <ReadonlyFieldData
        fieldName={element.name}
        form={reviewForm}
        formData={reviewFormData}
        threadedDiscussionProps={threadedDiscussionProps}
      />
    )
  }

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

      <ReviewItemsContainer>
        {[...nonFileFields, ...fileFields].map((element, i) => (
          <ReviewItemContainer key={element.id}>
            <Header>{element.shortDescription || element.title}</Header>
            {fieldRenderer(element)}
          </ReviewItemContainer>
        ))}
      </ReviewItemsContainer>
    </>
  )
}

export default ReviewDetailsModal
