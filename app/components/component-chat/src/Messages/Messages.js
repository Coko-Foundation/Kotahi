/* eslint-disable prefer-object-spread */

import React, { useEffect } from 'react'
// import { gql, useQuery } from '@apollo/client'
import PropTypes from 'prop-types'
import { UserAvatar } from '../../../component-avatar/src'
import { sortAndGroupMessages } from '../../../../sortAndGroup'
import NextPageButton from '../../../NextPageButton'
import { convertTimestampToDateString } from '../../../../shared/dateUtils'
import MessageRenderer from './MessageRenderer'
import { CommsErrorBanner } from '../../../shared'
import VideoChat from '../VideoChat'

import {
  Timestamp,
  Time,
  Message,
  MessageGroupContainer,
  MessagesGroup,
  GutterContainer,
  Bubble,
  InnerMessageContainer,
  Byline,
  Placeholder,
  Spinner,
} from './style'

const Messages = ({
  chatRoomId,
  channelId,
  fetchMoreData,
  queryData,
  manuscriptId = null,
}) => {
  const { loading, error, data } = queryData

  const scrollToBottom = () => {
    const main = document.getElementById('messages')

    if (!main || !data || !data.messages || data.messages.length === 0) {
      return
    }

    const { scrollHeight, clientHeight } = main
    main.scrollTop = scrollHeight - clientHeight
  }

  useEffect(() => {
    scrollToBottom()

    return () => {}
  })

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const messages = sortAndGroupMessages(data.messages.edges)
  const { hasPreviousPage } = data.messages.pageInfo
  return (
    <MessagesGroup id="messages">
      {manuscriptId ? <VideoChat manuscriptId={manuscriptId} /> : ''}
      {chatRoomId ? <VideoChat manuscriptId={chatRoomId} /> : ''}
      {hasPreviousPage && (
        <NextPageButton
          fetchMore={() => fetchMoreData()}
          isFetchingMore={false} // isFetchingMore}
        >
          Show previous messages
        </NextPageButton>
      )}
      {messages && !messages.length && (
        <Placeholder>
          No discussion for this manuscript yet. Start by typing a message
          below.
        </Placeholder>
      )}
      {messages.map(group => {
        const initialMessage = group[0]

        if (
          initialMessage.user.id === 'robo' &&
          initialMessage.type === 'timestamp'
        ) {
          return (
            <Timestamp key={initialMessage.created}>
              <hr />
              <Time>
                {convertTimestampToDateString(new Date(initialMessage.created))}
              </Time>
              <hr />
            </Timestamp>
          )
        }

        return (
          <MessageGroupContainer key={initialMessage.id}>
            {group.map((message, index) => (
              <Message key={message.id}>
                <GutterContainer>
                  {index === 0 && <UserAvatar user={message.user} />}
                </GutterContainer>
                <InnerMessageContainer>
                  {index === 0 && <Byline>{message.user.username}</Byline>}
                  <Bubble>
                    <MessageRenderer message={message} />
                  </Bubble>
                </InnerMessageContainer>
              </Message>
            ))}
          </MessageGroupContainer>
        )
      })}
    </MessagesGroup>
  )
}

Messages.propTypes = {
  channelId: PropTypes.string.isRequired,
}

export default Messages
