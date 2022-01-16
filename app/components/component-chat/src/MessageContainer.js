/* eslint-disable react/prop-types */
/* eslint-disable prefer-object-spread */

import React, { useEffect } from 'react'
import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { gql, useQuery, useMutation, useApolloClient } from '@apollo/client'
import Messages from './Messages/Messages'
import ChatInput from './SuperChatInput/SuperChatInput'
import { Tabs } from '../../shared'
import { CREATE_MESSAGE, SEARCH_USERS } from '../../../queries'
import useCurrentUser from '../../../hooks/useCurrentUser'

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

const MessageContainer = styled.section`
  background: rgb(255, 255, 255);
  display: grid;
  min-width: 100%;

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

const messageSection = channelId => {
  const queryResult = useQuery(GET_MESSAGES, {
    variables: { channelId },
  })

  const { data, subscribeToMore, fetchMore } = queryResult

  useEffect(() => {
    const unsubscribeToNewMessages = subscribeToNewMessages(
      subscribeToMore,
      channelId,
    )

    return () => {
      unsubscribeToNewMessages()
    }
  })
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

  const fetchMoreData = () => fetchMore(fetchMoreOptions)

  return (
    <Messages
      channelId={channelId}
      fetchMoreData={fetchMoreData}
      queryData={queryResult}
    />
  )
}

const chatSection = channelId => {
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

  const currentUser = useCurrentUser()

  const [sendChannelMessage] = useMutation(CREATE_MESSAGE)

  const sendChannelMessages = e => {
    sendChannelMessage({
      variables: e,
    })
  }

  return (
    <ChatInput
      channelId={channelId}
      currentUser={currentUser}
      searchUsers={searchUsers}
      sendChannelMessages={sendChannelMessages}
    />
  )
}

const Container = ({ channelId, channels }) => {
  if (!channelId && !channels) {
    return null
  }

  const tabs =
    channels &&
    channels.map(channel => ({
      label: channel.name,
      key: channel.id,
      content: (
        <>
          {messageSection(channel.id)}
          {chatSection(channel.id)}
        </>
      ),
    }))

  return (
    <MessageContainer channels={channels}>
      {tabs ? (
        <Tabs
          background="colorBackgroundHue"
          defaultActiveKey={tabs[0].key}
          sections={tabs}
        />
      ) : (
        <>
          {messageSection(channelId)}
          {chatSection(channelId)}
        </>
      )}
    </MessageContainer>
  )
}

export default Container
