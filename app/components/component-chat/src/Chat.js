import React from 'react'
import ChatInput from './SuperChatInput/SuperChatInput'
import Messages from './Messages/Messages'

const Chat = ({
  channelId,
  currentUser,
  searchUsers,
  sendChannelMessages,
  fetchMoreData,
  queryData,
  manuscriptId = null,
}) => {
  return (
    <>
      <ChatInput
        channelId={channelId}
        currentUser={currentUser}
        searchUsers={searchUsers}
        sendChannelMessages={sendChannelMessages}
      />
      <Messages
        channelId={channelId}
        fetchMoreData={fetchMoreData}
        manuscriptId={manuscriptId}
        queryData={queryData}
      />
    </>
  )
}

export default Chat
