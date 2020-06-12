// @flow
import React from 'react'
import { MentionsInput, Mention } from 'react-mentions'
import { useApolloClient } from '@apollo/react-hooks'
import { MentionsInputStyle } from './style'
import MentionSuggestion from './mentionSuggestion'
import { SEARCH_USERS } from '../../../../queries'
// import type { UserInfoType } from 'shared/graphql/fragments/user/userInfo';
// import type { ApolloClient } from 'apollo-client';

// type Props = {
//   value: string,
//   onChange: string => void,
//   staticSuggestions?: Array<UserInfoType>,
//   client: ApolloClient,
//   placeholder?: string,
//   hasAttachment?: boolean,
//   onFocus?: Function,
//   onBlur?: Function,
//   onKeyDown?: Function,
//   inputRef?: Function,
//   dataCy?: string,
//   networkDisabled?: boolean,
// };

const cleanSuggestionUserObject = user => {
  if (!user) return null
  return {
    ...user,
    id: user.username,
    display: user.username,
    filterName: (user.name && user.name.toLowerCase()) || user.username.toLowerCase(),
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

const CustomMentionsInput = props => {
  const client = useApolloClient()
  const searchUsers = async (queryString, callback) => {
    const staticSuggestions = !props.staticSuggestions
      ? []
      : props.staticSuggestions
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
      return
    }

    const cleanSearchUsers = rawSearchUsers.map(user => cleanSuggestionUserObject(user))


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

  const {
    dataCy,
    networkDisabled,
    staticSuggestions,
    hasAttachment,
    ...rest
  } = props

  return (
    <MentionsInput
      data-cy={props.dataCy}
      {...rest}
      style={{ ...(props.style || {}), ...MentionsInputStyle }}
    >
      <Mention
        appendSpaceOnAdd
        displayTransform={username => `@${username}`}
        markup="@[__id__]"
        data={searchUsers}
        renderSuggestion={(
          entry,
          search,
          highlightedDisplay,
          index,
          focused,
        ) => (
          <MentionSuggestion
            entry={entry}
            focused={focused}
            highlightedDisplay={highlightedDisplay}
            index={index}
            search={search}
          />
        )}
        trigger="@"
      />
    </MentionsInput>
  )
}

export default CustomMentionsInput
