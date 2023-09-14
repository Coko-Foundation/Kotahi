import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { useMutation } from '@apollo/client'
import EditDeleteMessageModal from './EditDeleteMessageModal'
import { ConfirmationModal } from '../../../component-modal/src/ConfirmationModal'
import { DELETE_MESSAGE, UPDATE_MESSAGE } from '../../../../queries'
import { Ellipsis } from './style'
import color from '../../../../theme/color'
import IsolatedMessageWithDetails from './IsolatedMessageWithDetails'
import { LooseColumn } from '../../../shared'

const DropdownContainer = styled.div`
  background-color: ${color.backgroundA};
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  position: absolute;
  right: 0;
  top: -4px;
  width: 145px;
  z-index: 1000;
`

const DropdownItem = styled.div`
  color: ${color.text};
  cursor: pointer;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  padding: 6px 14px 6px 14px;

  &:hover {
    background-color: ${color.gray97};
  }
`

const ChatPostDropdown = ({
  show,
  message,
  currentUser = {},
  onDropdownHide = () => {},
}) => {
  const { globalRoles = [], groupRoles = [] } = currentUser
  const [isOpen, setIsOpen] = useState(show)
  const [isEditingMessage, setIsEditingMessage] = useState(false)
  const [isDeletingMessage, setIsDeletingMessage] = useState(false)

  const [deleteMessage] = useMutation(DELETE_MESSAGE)
  const [updateMessage] = useMutation(UPDATE_MESSAGE)

  const isAdmin = globalRoles.includes('admin')
  const isAuthor = message.user.username === currentUser.username
  const isGroupManager = groupRoles.includes('groupManager')
  const canDeletePost = isAuthor || (isAdmin && isGroupManager)
  const canEditPost = isAuthor

  const handleEditConfirmation = async editedMessage => {
    try {
      await updateMessage({
        variables: {
          messageId: message.id,
          content: editedMessage,
        },
        // eslint-disable-next-line no-shadow
        update: (cache, { data: { updateMessage } }) => {
          cache.modify({
            id: cache.identify({
              __typename: 'Message',
              id: message.id,
            }),
            fields: {
              content: () => updateMessage.content,
            },
          })
        },
      })

      setIsEditingMessage(false)
    } catch (error) {
      console.error('Error updating message:', error)
    }
  }

  const handleDeleteConfirmation = async () => {
    try {
      await deleteMessage({
        variables: {
          messageId: message.id,
        },
        update: cache => {
          const cacheKey = cache.identify({
            id: message.id,
            __typename: 'Message',
          })

          cache.evict({ id: cacheKey })
        },
      })
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const hideDropdown = () => {
    setIsOpen(false)
    onDropdownHide()
  }

  const dropdownRef = useRef(null)

  useEffect(() => {
    setIsOpen(show)

    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        hideDropdown()
      }
    }

    window.addEventListener('click', handleClickOutside)

    return () => {
      window.removeEventListener('click', handleClickOutside)
    }
  }, [show])

  return (
    <>
      {isOpen && (
        <DropdownContainer ref={dropdownRef}>
          <Ellipsis
            className="dropdown-ellipsis"
            onClick={() => hideDropdown()}
          />
          <div>
            {canEditPost && (
              <DropdownItem onClick={() => setIsEditingMessage(true)}>
                Edit
              </DropdownItem>
            )}
            {canDeletePost && (
              <DropdownItem onClick={() => setIsDeletingMessage(true)}>
                Delete
              </DropdownItem>
            )}
          </div>
        </DropdownContainer>
      )}
      <ConfirmationModal
        closeModal={() => setIsDeletingMessage(false)}
        confirmationAction={handleDeleteConfirmation}
        confirmationButtonText="Delete"
        isOpen={isDeletingMessage}
        message={
          <LooseColumn>
            Are you sure you want to delete this message?
            <IsolatedMessageWithDetails message={message} />
          </LooseColumn>
        }
      />
      {isEditingMessage && (
        <EditDeleteMessageModal
          cancelText="No"
          close={() => setIsEditingMessage(false)}
          confirmText="Update"
          isEdit
          message={message}
          onConfirm={handleEditConfirmation}
          title="Edit message"
        />
      )}
    </>
  )
}

export default ChatPostDropdown
