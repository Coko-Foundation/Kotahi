import React, { useEffect } from 'react'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/client'
import PropTypes from 'prop-types'
import { UserAvatar } from '../../../component-avatar/src'
import { sortAndGroupMessages } from '../../../../sortAndGroup'
import NextPageButton from '../../../NextPageButton'
import { convertTimestampToDate } from '../../../../shared/time-formatting'
import MessageRenderer from './MessageRenderer'

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

const GET_MESSAGES = gql`
  query messages($channelId: ID, $before: String) {
    messages(channelId: $channelId, before: $before) {
      edges {
        id
        content
        created
        updated
        user {
          id
          username
          profilePicture
          online
          defaultIdentity {
            identifier
            email
            type
            aff
            id
            name
          }
        }
      }
      pageInfo {
        startCursor
        hasPreviousPage
      }
    }
  }
`

const MESSAGES_SUBSCRIPTION = gql`
  subscription messageCreated($channelId: ID) {
    messageCreated(channelId: $channelId) {
      id
      created
      updated
      content
      user {
        id
        username
        profilePicture
        online
        defaultIdentity {
          identifier
          email
          type
          aff
          id
          name
        }
      }
    }
  }
`

const subscribeToNewMessages = (subscribeToMore, channelId) =>
  subscribeToMore({
    document: MESSAGES_SUBSCRIPTION,
    variables: { channelId },
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev
      const { messageCreated } = subscriptionData.data
      const exists = prev.messages.edges.find(
        ({ id }) => id === messageCreated.id,
      )
      if (exists) return prev

      return Object.assign({}, prev, {
        messages: {
          ...prev.messages,
          edges: [...prev.messages.edges, messageCreated],
        },
      })
    },
  })
const Messages = ({ channelId }) => {
  const { loading, error, data, subscribeToMore, fetchMore } = useQuery(
    GET_MESSAGES,
    {
      variables: { channelId },
    },
  )

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

    const unsubscribeToNewMessages = subscribeToNewMessages(
      subscribeToMore,
      channelId,
    )
    // const unsubscribeToEnhancedMessages = subscribeToEnhancedMessages(
    //   subscribeToMore,
    //   channelId,
    // )

    return () => {
      unsubscribeToNewMessages()
      // unsubscribeToEnhancedMessages()
    }
  })

  if (loading) return <Spinner />
  if (error) return JSON.stringify(error)

  const firstMessage = data?.messages.edges[0]

  const fetchMoreOptions = {
    variables: { channelId, before: firstMessage && firstMessage.id },
    updateQuery: (prev, { fetchMoreResult }) => {
      if (!fetchMoreResult) return prev
      return Object.assign({}, prev, {
        messages: {
          ...prev.messages,
          edges: [...fetchMoreResult.messages.edges, ...prev.messages.edges],
          pageInfo: fetchMoreResult.messages.pageInfo,
        },
      })
    },
  }

  const messages = sortAndGroupMessages(data.messages.edges)
  const { hasPreviousPage } = data.messages.pageInfo
  return (
    <MessagesGroup id="messages">
      {hasPreviousPage && (
        <NextPageButton
          fetchMore={() => fetchMore(fetchMoreOptions)}
          // href={{
          //   pathname: this.props.location.pathname,
          //   search: queryString.stringify({
          //     ...queryString.parse(this.props.location.search),
          //     msgsbefore: messageConnection.edges[0].cursor,
          //     msgsafter: undefined,
          //   }),
          // }}
          // automatic={!!thread.watercooler}
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
                {convertTimestampToDate(new Date(initialMessage.created))}
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
                  {index === 0 && (
                    <Byline>{message.user.defaultIdentity.name}</Byline>
                  )}
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
