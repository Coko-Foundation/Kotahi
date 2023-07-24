import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'
import ChatInput from './SuperChatInput/SuperChatInput'
import Messages from './Messages/Messages'

const ChatInputContainer = styled.div`
  position: relative;
`

export const FloatingUnreadLabelContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  position: absolute;
  top: -26px;
  width: 100%;
`
export const FloatingUnreadLabel = styled.div`
  background-color: ${th('colors.brand1.tint25')};
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: 18px;
  padding: 2px 30px;
  position: relative;
`
export const FloatingUnreadLabelClose = styled.span`
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  padding: 2px 8px;
  position: absolute;
  right: 0;
  top: 0;
`

const Chat = ({
  channelId,
  chatRoomId,
  currentUser,
  searchUsers,
  sendChannelMessages,
  fetchMoreData,
  queryData,
  unreadMessagesCount,
  firstUnreadMessageId,
  updateChannelViewed,
  manuscriptId = null,
}) => {
  const [showFloatingUnreadLabel, setShowFloatingUnreadLabel] = useState(false)

  useEffect(() => {
    setShowFloatingUnreadLabel(!!unreadMessagesCount)
  }, [unreadMessagesCount])

  const handleFloatingUnreadLabelClose = () => {
    setShowFloatingUnreadLabel(false)
  }

  return (
    <>
      <Messages
        channelId={channelId}
        chatRoomId={chatRoomId}
        fetchMoreData={fetchMoreData}
        firstUnreadMessageId={firstUnreadMessageId}
        manuscriptId={manuscriptId}
        queryData={queryData}
        unreadMessagesCount={unreadMessagesCount}
        updateChannelViewed={updateChannelViewed}
      />
      <ChatInputContainer>
        {showFloatingUnreadLabel && (
          <FloatingUnreadLabelContainer>
            <FloatingUnreadLabel>
              <span>You have {unreadMessagesCount} unread messages</span>
              <FloatingUnreadLabelClose
                onClick={handleFloatingUnreadLabelClose}
              >
                &#215;
              </FloatingUnreadLabelClose>
            </FloatingUnreadLabel>
          </FloatingUnreadLabelContainer>
        )}
        <ChatInput
          channelId={channelId}
          currentUser={currentUser}
          searchUsers={searchUsers}
          sendChannelMessages={sendChannelMessages}
        />
      </ChatInputContainer>
    </>
  )
}

export default Chat
