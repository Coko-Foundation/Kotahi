/* eslint-disable react/prop-types */
/* eslint-disable prefer-object-spread */

import React, { useEffect } from 'react'
import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client'
import { useLocation } from 'react-router-dom'
import { HiddenTabs } from '../../shared'
import { CREATE_MESSAGE, SEARCH_USERS } from '../../../queries'
import Chat from './Chat'
import { getActiveTab } from '../../../shared/manuscriptUtils'

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
          isOnline
        }
      }
      pageInfo {
        startCursor
        hasPreviousPage
      }
      unreadMessagesCount
      firstUnreadMessageId
    }
  }
`

const MESSAGES_SUBSCRIPTION = gql`
  subscription messageCreated($channelId: ID!) {
    messageCreated(channelId: $channelId) {
      id
      created
      updated
      content
      user {
        id
        username
        profilePicture
        isOnline
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

const MESSAGE_DELETED_SUBSCRIPTION = gql`
  subscription messageDeleted($channelId: ID!) {
    messageDeleted(channelId: $channelId) {
      id
      content
    }
  }
`

const MESSAGE_UPDATED_SUBSCRIPTION = gql`
  subscription messageUpdated($channelId: ID!) {
    messageUpdated(channelId: $channelId) {
      id
      created
      updated
      content
      user {
        id
        username
        profilePicture
        isOnline
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

const CHANNEL_VIEWED = gql`
  mutation channelViewed($channelId: ID!) {
    channelViewed(channelId: $channelId) {
      channelId
      userId
      lastViewed
    }
  }
`

const GET_CHANNEL_NOTIFICATION_OPTION = gql`
  query notificationOption($path: [String!]!) {
    notificationOption(path: $path) {
      userId
      objectId
      path
      groupId
      option
      objectId
    }
  }
`

const UPDATE_CHANNEL_NOTIFICATION_OPTION = gql`
  mutation updateNotificationOption($path: [String!]!, $option: String!) {
    updateNotificationOption(path: $path, option: $option) {
      id
      created
      updated
      userId
      path
      option
      groupId
    }
  }
`

const REPORT_USER_IS_ACTIVE = gql`
  mutation reportUserIsActive($path: [String!]!) {
    reportUserIsActive(path: $path)
  }
`

const MessageContainer = styled.section`
  background: rgb(255, 255, 255);
  display: flex;
  flex-direction: column;
  height: 100vh;

  ${props =>
    props.channels
      ? css`
          grid-template-rows: ${grid(5)} 1fr calc(${th('gridUnit')} * 8);
        `
      : css`
          grid-template-rows: 1fr calc(${th('gridUnit')} * 8);
        `}

  ${props =>
    props.channels
      ? css`
          grid-template-areas:
            'channels'
            'read'
            'write';
        `
      : css`
          grid-template-areas:
            'read'
            'write';
        `}

  padding-top: -12px;
  position: relative;
  width: 100%;
`

const cleanSuggestionUserObject = user => {
  if (!user) return null
  return {
    ...user,
    id: user.username,
    display: user.username,
    filterName:
      (user.name && user.name.toLowerCase()) || user.username.toLowerCase(),
  }
}

const sortSuggestions = (a, b, queryString) => {
  const aUsernameIndex = a.username.indexOf(queryString || '')
  const bUsernameIndex = b.username.indexOf(queryString || '')
  const aNameIndex = a.filterName.indexOf(queryString || '')
  const bNameIndex = b.filterName.indexOf(queryString || '')
  if (aNameIndex === 0) return -1
  if (aUsernameIndex === 0) return -1
  if (aNameIndex === 0) return -1
  if (aUsernameIndex === 0) return -1
  return aNameIndex - bNameIndex || aUsernameIndex - bUsernameIndex
}

const handleMessageSubscriptionUpdate = (prev, subscriptionData, idKey) => {
  if (!subscriptionData.data) return prev

  const newData = subscriptionData.data[idKey]

  const exists = prev.messages.edges.find(({ id }) => id === newData.id)

  if (exists) return prev

  return {
    ...prev,
    messages: {
      ...prev.messages,
      edges: [...prev.messages.edges, newData],
    },
  }
}

const subscribeToNewMessages = (subscribeToMore, channelId) =>
  subscribeToMore({
    document: MESSAGES_SUBSCRIPTION,
    variables: { channelId },
    updateQuery: (prev, { subscriptionData }) =>
      handleMessageSubscriptionUpdate(prev, subscriptionData, 'messageCreated'),
  })

const subscribeToUpdatedMessage = (subscribeToMore, channelId) =>
  subscribeToMore({
    document: MESSAGE_UPDATED_SUBSCRIPTION,
    variables: { channelId },
    updateQuery: (prev, { subscriptionData }) =>
      handleMessageSubscriptionUpdate(prev, subscriptionData, 'messageUpdated'),
  })

const subscribeToDeletedMessage = (subscribeToMore, channelId) =>
  subscribeToMore({
    document: MESSAGE_DELETED_SUBSCRIPTION,
    variables: { channelId },
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev

      const deletedId = subscriptionData.data.messageDeleted.id

      const updatedEdges = prev.messages.edges.filter(
        ({ id }) => id !== deletedId,
      )

      return {
        ...prev,
        messages: {
          ...prev.messages,
          edges: updatedEdges,
        },
      }
    },
  })

const chatComponent = (
  channelId,
  channelName,
  manuscriptId,
  chatRoomId,
  currentUser,
) => {
  const client = useApolloClient()

  const staticSuggestion = []

  const searchUsers = async (queryString, callback) => {
    const staticSuggestions = staticSuggestion
      ? []
      : staticSuggestion
          .map(cleanSuggestionUserObject)
          .filter(Boolean)
          .filter(
            user =>
              user.username &&
              (user.username.indexOf(queryString || '') > -1 ||
                user.filterName.indexOf(queryString || '') > -1),
          )
          .sort((a, b) => sortSuggestions(a, b, queryString))
          .slice(0, 8)

    callback(staticSuggestions)

    if (!queryString || queryString.length === 0)
      return callback(staticSuggestions)

    const {
      data: { searchUsers: rawSearchUsers },
    } = await client.query({
      query: SEARCH_USERS,
      variables: {
        query: queryString,
      },
    })

    if (!rawSearchUsers || rawSearchUsers.length === 0) {
      if (staticSuggestions && staticSuggestions.length > 0)
        return staticSuggestions
      // eslint-disable-next-line consistent-return
      return
    }

    const cleanSearchUsers = rawSearchUsers.map(user =>
      cleanSuggestionUserObject(user),
    )

    // Prepend the filtered participants in case a user is tabbing down right now
    const fullResults = [...staticSuggestions, ...cleanSearchUsers]
    const uniqueResults = []
    const done = []

    fullResults.forEach(item => {
      if (done.indexOf(item.username) === -1) {
        uniqueResults.push(item)
        done.push(item.username)
      }
    })

    return callback(uniqueResults.slice(0, 8))
  }

  const [sendChannelMessage] = useMutation(CREATE_MESSAGE)

  const sendChannelMessages = e => {
    sendChannelMessage({
      variables: e,
    })
  }

  const queryResult = useQuery(GET_MESSAGES, {
    variables: { channelId },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  })

  const { data, subscribeToMore, fetchMore } = queryResult

  const [updateChannelViewed] = useMutation(CHANNEL_VIEWED)

  const [reportUserIsActiveMutation] = useMutation(REPORT_USER_IS_ACTIVE)

  const [updateNotificationOptionData] = useMutation(
    UPDATE_CHANNEL_NOTIFICATION_OPTION,
  )

  const { data: notificationOptionData } = useQuery(
    GET_CHANNEL_NOTIFICATION_OPTION,
    {
      variables: {
        path: ['chat', channelId],
      },
    },
  )

  useEffect(() => {
    const unsubscribeToNewMessages = subscribeToNewMessages(
      subscribeToMore,
      channelId,
    )

    const unsubscribeToUpdatedMessages = subscribeToUpdatedMessage(
      subscribeToMore,
      channelId,
    )

    const unsubscribeToDeletedMessages = subscribeToDeletedMessage(
      subscribeToMore,
      channelId,
    )

    return () => {
      unsubscribeToNewMessages()
      unsubscribeToUpdatedMessages()
      unsubscribeToDeletedMessages()
    }
  }, [])

  const firstMessage = data?.messages.edges[0]
  const unreadMessagesCount = data?.messages.unreadMessagesCount
  const firstUnreadMessageId = data?.messages.firstUnreadMessageId

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

  const fetchMoreData = () => fetchMore(fetchMoreOptions)
  return (
    <Chat
      channelId={channelId}
      chatRoomId={chatRoomId}
      currentUser={currentUser}
      fetchMoreData={fetchMoreData}
      firstUnreadMessageId={firstUnreadMessageId}
      manuscriptId={
        channelName !== 'Discussion with author' ? manuscriptId : null
      }
      notificationOptionData={notificationOptionData}
      queryData={queryResult}
      reportUserIsActiveMutation={reportUserIsActiveMutation}
      searchUsers={searchUsers}
      sendChannelMessages={sendChannelMessages}
      unreadMessagesCount={unreadMessagesCount}
      updateChannelViewed={updateChannelViewed}
      updateNotificationOptionData={updateNotificationOptionData}
    />
  )
}

const Container = ({
  channelId: optionalChannelId,
  channels,
  chatRoomId,
  hideChat,
  manuscriptId = null,
  currentUser,
}) => {
  const channelId = optionalChannelId ?? channels?.[0]?.id
  if (!channelId) return null

  const tabs =
    channels &&
    channels.map(channel => ({
      label: channel.name,
      key: channel.type,
      active: channel.active,
      content: (
        <>
          {chatComponent(
            channel.id,
            channel.name,
            manuscriptId,
            chatRoomId,
            currentUser,
          )}
        </>
      ),
    }))

  const client = useApolloClient()

  const staticSuggestion = []

  const searchUsers = async (queryString, callback) => {
    const staticSuggestions = staticSuggestion
      ? []
      : staticSuggestion
          .map(cleanSuggestionUserObject)
          .filter(Boolean)
          .filter(
            user =>
              user.username &&
              (user.username.indexOf(queryString || '') > -1 ||
                user.filterName.indexOf(queryString || '') > -1),
          )
          .sort((a, b) => sortSuggestions(a, b, queryString))
          .slice(0, 8)

    callback(staticSuggestions)

    if (!queryString || queryString.length === 0)
      return callback(staticSuggestions)

    const {
      data: { searchUsers: rawSearchUsers },
    } = await client.query({
      query: SEARCH_USERS,
      variables: {
        query: queryString,
      },
    })

    if (!rawSearchUsers || rawSearchUsers.length === 0) {
      if (staticSuggestions && staticSuggestions.length > 0)
        return staticSuggestions
      // eslint-disable-next-line consistent-return
      return
    }

    const cleanSearchUsers = rawSearchUsers.map(user =>
      cleanSuggestionUserObject(user),
    )

    // Prepend the filtered participants in case a user is tabbing down right now
    const fullResults = [...staticSuggestions, ...cleanSearchUsers]
    const uniqueResults = []
    const done = []

    fullResults.forEach(item => {
      if (done.indexOf(item.username) === -1) {
        uniqueResults.push(item)
        done.push(item.username)
      }
    })

    return callback(uniqueResults.slice(0, 8))
  }

  const [sendChannelMessage] = useMutation(CREATE_MESSAGE)

  const sendChannelMessages = e => {
    sendChannelMessage({
      variables: e,
    })
  }

  const queryResult = useQuery(GET_MESSAGES, {
    variables: { channelId },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  })

  const { data, subscribeToMore, fetchMore } = queryResult
  const [updateChannelViewed] = useMutation(CHANNEL_VIEWED)

  const [reportUserIsActiveMutation] = useMutation(REPORT_USER_IS_ACTIVE)

  const { data: notificationOptionData } = useQuery(
    GET_CHANNEL_NOTIFICATION_OPTION,
    {
      variables: {
        path: ['chat', channelId],
      },
    },
  )

  const [updateNotificationOptionData] = useMutation(
    UPDATE_CHANNEL_NOTIFICATION_OPTION,
  )

  useEffect(() => {
    const unsubscribeToNewMessages = subscribeToNewMessages(
      subscribeToMore,
      channelId,
    )

    const unsubscribeToUpdatedMessages = subscribeToUpdatedMessage(
      subscribeToMore,
      channelId,
    )

    const unsubscribeToDeletedMessages = subscribeToDeletedMessage(
      subscribeToMore,
      channelId,
    )

    return () => {
      unsubscribeToNewMessages()
      unsubscribeToUpdatedMessages()
      unsubscribeToDeletedMessages()
    }
  }, [])

  const firstMessage = data?.messages.edges[0]
  const unreadMessagesCount = data?.messages.unreadMessagesCount
  const firstUnreadMessageId = data?.messages.firstUnreadMessageId

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

  const fetchMoreData = () => fetchMore(fetchMoreOptions)

  const location = useLocation()

  const activeTab = React.useMemo(() => getActiveTab(location, 'discussion'), [
    location,
  ])

  let activeDiscussionKey = tabs && tabs.length && tabs[0].key
  if (activeTab) activeDiscussionKey = activeTab

  return (
    <MessageContainer channels={channels}>
      {tabs ? (
        <HiddenTabs
          background="colorBackgroundHue"
          defaultActiveKey={activeDiscussionKey}
          hideChat={hideChat}
          sections={tabs}
        />
      ) : (
        <>
          <Chat
            channelId={channelId}
            chatRoomId={chatRoomId}
            currentUser={currentUser}
            fetchMoreData={fetchMoreData}
            firstUnreadMessageId={firstUnreadMessageId}
            manuscriptId={manuscriptId}
            notificationOptionData={notificationOptionData}
            queryData={queryResult}
            reportUserIsActiveMutation={reportUserIsActiveMutation}
            searchUsers={searchUsers}
            sendChannelMessages={sendChannelMessages}
            unreadMessagesCount={unreadMessagesCount}
            updateChannelViewed={updateChannelViewed}
            updateNotificationOptionData={updateNotificationOptionData}
          />
        </>
      )}
    </MessageContainer>
  )
}

export default Container
