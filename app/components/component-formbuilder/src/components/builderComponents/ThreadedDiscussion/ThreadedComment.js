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
    <>
      <CommentContainer>
        <CommentWrapper key={comment.id}>
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
            {setShouldPublish && (
              <FieldPublishingSelector
                onChange={setShouldPublish}
                value={shouldPublish}
              />
            )}
            {(userCanEditAnyComment ||
              (userCanEditOwnComment && author.id === currentUser.id)) && (
              <Icon
                noPadding
                onClick={event => {
                  setOpenModal(true)
                }}
              >
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
        {hasValue(submittedValue) ? (
          <SimpleWaxEditorWrapper collapse={collapse}>
            <SimpleWaxEditor
              {...simpleWaxEditorProps}
              key={counter}
              readonly
              value={submittedValue}
            />
            <CollapseOverlay collapse={collapse} />
          </SimpleWaxEditorWrapper>
        ) : (
          'Comment is deleted'
        )}
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
    </>
  )
}

export default ThreadedComment
