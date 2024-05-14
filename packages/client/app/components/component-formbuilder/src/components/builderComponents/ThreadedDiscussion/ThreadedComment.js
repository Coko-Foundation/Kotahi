import React, { useState } from 'react'
import Moment from 'react-moment'
import { Button } from '@pubsweet/ui'
import Tooltip from '../../../../../component-reporting/src/Tooltip'
import {
  CommentMetaWrapper,
  UserMetaWrapper,
  SimpleWaxEditorWrapper,
  CollapseOverlay,
  CommentWrapper,
  ActionWrapper,
  Collapse,
  ModalContainer,
  CancelButton,
  CommentContainer,
} from '../../style'
import { FieldPublishingSelector, Icon } from '../../../../../shared'
import { UserAvatar } from '../../../../../component-avatar/src'
import Modal from '../../../../../component-modal/src/ConfirmationModal'
import SimpleWaxEditor from '../../../../../wax-collab/src/SimpleWaxEditor'
import { hasValue } from '../../../../../../shared/htmlUtils'

const ThreadedComment = ({
  comment,
  currentUser,
  simpleWaxEditorProps,
  userCanEditOwnComment,
  userCanEditAnyComment,
  onCancel,
  onChange,
  onSubmit,
  shouldPublish,
  setShouldPublish,
  selectedManuscriptVersionId,
  isLatestVersionOfManuscript,
}) => {
  const {
    comment: value,
    author,
    createdAt,
    updatedAt,
    existingComment, // If this comment is in the process of being edited, existingComment contains the value prior to editing
    shouldExpandByDefault,
  } = comment

  const [openModal, setOpenModal] = useState(false)

  const [submittedValue, setSubmittedValue] = useState(
    existingComment?.comment || '',
  )

  const commentBelongsToDifferentManuscriptVersion =
    selectedManuscriptVersionId !== comment.manuscriptVersionId

  const canEditComment =
    userCanEditAnyComment ||
    (userCanEditOwnComment && author.id === currentUser.id)

  const canEditThisComment = comment.manuscriptVersionId
    ? isLatestVersionOfManuscript &&
      selectedManuscriptVersionId === comment.manuscriptVersionId &&
      canEditComment
    : canEditComment

  const shouldShowEditIcon =
    (!comment.manuscriptVersionId && canEditComment) || canEditThisComment

  const [modalFieldValue, setModalFieldValue] = useState(value)
  const [counter, setCounter] = useState(1)
  const [collapse, setCollapse] = useState(!shouldExpandByDefault)

  const onSubmitClick = () => {
    setSubmittedValue(modalFieldValue)
    setCounter(counter + 1)
    setOpenModal(false)
    onSubmit()
  }

  return (
    <CommentContainer
      commentBelongsToDifferentManuscriptVersion={
        commentBelongsToDifferentManuscriptVersion
      }
    >
      <CommentWrapper
        commentBelongsToDifferentManuscriptVersion={
          commentBelongsToDifferentManuscriptVersion
        }
        key={comment.id}
      >
        <CommentMetaWrapper>
          <UserMetaWrapper>
            <UserAvatar user={author} />
            {author.username}
          </UserMetaWrapper>
        </CommentMetaWrapper>
        <ActionWrapper>
          <div>
            <Moment format="YYYY-MM-DD">{createdAt}</Moment>
            <Tooltip
              content={
                <>
                  Created at &nbsp;
                  <Moment format="YYYY-MM-DD HH:mm:ss">{createdAt}</Moment>
                  <br />
                  Updated at &nbsp;
                  <Moment format="YYYY-MM-DD HH:mm:ss">{updatedAt}</Moment>
                </>
              }
            />
          </div>
          {setShouldPublish && isLatestVersionOfManuscript && (
            <FieldPublishingSelector
              onChange={setShouldPublish}
              value={shouldPublish}
            />
          )}
          {shouldShowEditIcon && (
            <Icon noPadding onClick={() => setOpenModal(true)}>
              edit
            </Icon>
          )}

          <Collapse
            onClick={event => {
              setCollapse(!collapse)
            }}
            value={collapse}
          >
            <Icon noPadding>{collapse ? 'chevron-down' : 'chevron-up'}</Icon>
          </Collapse>
        </ActionWrapper>
      </CommentWrapper>
      <SimpleWaxEditorWrapper collapse={collapse}>
        <SimpleWaxEditor
          {...simpleWaxEditorProps}
          key={counter}
          readonly
          value={
            hasValue(submittedValue)
              ? submittedValue
              : 'Comment is either deleted or is unsubmitted'
          }
        />
        <CollapseOverlay collapse={collapse} />
      </SimpleWaxEditorWrapper>
      <Modal isOpen={openModal}>
        <ModalContainer>
          <SimpleWaxEditor
            {...simpleWaxEditorProps}
            onChange={data => {
              setModalFieldValue(data)
              onChange(data)
            }}
            value={modalFieldValue}
          />
          <Button
            onClick={event => {
              onSubmitClick()
            }}
            primary
          >
            Edit
          </Button>
          &nbsp;
          <CancelButton
            onClick={() => {
              setOpenModal(false)
              setModalFieldValue(existingComment?.comment || value)
              onCancel()
            }}
          >
            Cancel
          </CancelButton>
        </ModalContainer>
      </Modal>
    </CommentContainer>
  )
}

export default ThreadedComment
