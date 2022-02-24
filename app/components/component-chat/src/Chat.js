import React from 'react'
import ChatInput from './SuperChatInput/SuperChatInput'
import Messages from './Messages/Messages'

const Chat = ({
  channelId,
  chatRoomId,
  currentUser,
  searchUsers,
  sendChannelMessages,
  fetchMoreData,
  queryData,
  manuscriptId = null,
}) => {
  return (
    <>
      <Messages
        channelId={channelId}
        chatRoomId={chatRoomId}
        fetchMoreData={fetchMoreData}
        manuscriptId={manuscriptId}
        queryData={queryData}
      />
      <ChatInput
        channelId={channelId}
        currentUser={currentUser}
        searchUsers={searchUsers}
        sendChannelMessages={sendChannelMessages}
      />
    </>
  )
}

export default Chat
