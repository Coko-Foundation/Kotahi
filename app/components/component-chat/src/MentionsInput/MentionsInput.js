/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable consistent-return */

// @flow
import React from 'react'
import { MentionsInput, Mention } from 'react-mentions'
// import { useApolloClient } from '@apollo/client'
import { th } from '@pubsweet/ui-toolkit'
import { MentionsInputStyle } from './style'
import MentionSuggestion from './mentionSuggestion'
// import { SEARCH_USERS } from '../../../../queries'
import { theme, hexa } from '../SuperChatInput/style'

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

// const cleanSuggestionUserObject = user => {
//   if (!user) return null
//   return {
//     ...user,
//     id: user.username,
//     display: user.username,
//     filterName:
//       (user.name && user.name.toLowerCase()) || user.username.toLowerCase(),
//   }
// }

// const sortSuggestions = (a, b, queryString) => {
//   const aUsernameIndex = a.username.indexOf(queryString || '')
//   const bUsernameIndex = b.username.indexOf(queryString || '')
//   const aNameIndex = a.filterName.indexOf(queryString || '')
//   const bNameIndex = b.filterName.indexOf(queryString || '')
//   if (aNameIndex === 0) return -1
//   if (aUsernameIndex === 0) return -1
//   if (aNameIndex === 0) return -1
//   if (aUsernameIndex === 0) return -1
//   return aNameIndex - bNameIndex || aUsernameIndex - bUsernameIndex
// }

const CustomMentionsInput = props => {
  const { searchUsersCallBack } = props
  // const client = useApolloClient()

  const searchUsers = async () => {
    searchUsersCallBack()
  }

  // const searchUsers = async (queryString, callback) => {
  //   const staticSuggestions = !props.staticSuggestions
  //     ? []
  //     : props.staticSuggestions
  //         .map(cleanSuggestionUserObject)
  //         .filter(Boolean)
  //         .filter(
  //           user =>
  //             user.username &&
  //             (user.username.indexOf(queryString || '') > -1 ||
  //               user.filterName.indexOf(queryString || '') > -1),
  //         )
  //         .sort((a, b) => sortSuggestions(a, b, queryString))
  //         .slice(0, 8)

  //   callback(staticSuggestions)

  //   if (!queryString || queryString.length === 0)
  //     return callback(staticSuggestions)

  //   const {
  //     data: { searchUsers: rawSearchUsers },
  //   } = await client.query({
  //     query: SEARCH_USERS,
  //     variables: {
  //       query: queryString,
  //     },
  //   })

  //   if (!rawSearchUsers || rawSearchUsers.length === 0) {
  //     if (staticSuggestions && staticSuggestions.length > 0)
  //       return staticSuggestions
  //     return
  //   }

  //   const cleanSearchUsers = rawSearchUsers.map(user =>
  //     cleanSuggestionUserObject(user),
  //   )

  //   // Prepend the filtered participants in case a user is tabbing down right now
  //   const fullResults = [...staticSuggestions, ...cleanSearchUsers]
  //   const uniqueResults = []
  //   const done = []

  //   fullResults.forEach(item => {
  //     if (done.indexOf(item.username) === -1) {
  //       uniqueResults.push(item)
  //       done.push(item.username)
  //     }
  //   })

  //   return callback(uniqueResults.slice(0, 8))
  // }

  const extraStyle = {
    dataCy: props.dataCy || 'chat-input',
    spellCheck: true,
    autoCapitalize: 'sentences',
    autoComplete: 'on',
    autoCorrect: 'on',
    background: `${props.networkDisabled ? 'none' : th('colorBackground')}`,
    fontSize: '16px' /* has to be 16px to avoid zoom on iOS */,
    fontWeight: 400,
    lineHeight: 1.4,

    // @media (max-width: ${MEDIA_BREAK}px) {
    //   font-size: 16px;
    // }

    div: {
      lineHeight: '1.4 !important',
      wordBreak: 'break-word',
    },
    textarea: {
      lineHeight: '1.4 !important',
      wordBreak: 'break-word',
    },

    '&::placeholder': {
      color: `${
        props.networkDisabled
          ? hexa(th('colorWarning'), 0.8)
          : th('colorSecondary')
      }`,
    },

    '&::-webkit-input-placeholder': {
      color: `${
        props.networkDisabled
          ? hexa(th('colorWarning'), 0.8)
          : th('colorSecondary')
      }`,
    },

    '&:-moz-placeholder': {
      color: `${
        props.networkDisabled
          ? hexa(th('colorWarning'), 0.8)
          : th('colorSecondary')
      }`,
    },

    '&:-ms-input-placeholder': {
      color: `${
        props.networkDisabled
          ? hexa(th('colorWarning'), 0.8)
          : th('colorSecondary')
      }`,
    },

    pre: {
      // `${monoStack}`,

      /* stylelint-disable-next-line order/properties-alphabetical-order */
      backgroundColor: `${theme.bg.wash}`,
      border: `1px solid ${th('colorBorder')}`,
      borderRadius: `2px`,
      fontSize: `15px`,
      fontWeight: 500,
      marginRight: `16px`,
      padding: `4px`,
    },

    blockquote: {
      borderLeft: `4px solid ${th('colorBorder')}`,
      color: `${theme.text.alt}`,
      lineHeight: 1.5,
      padding: `4px 12px 4px 16px`,
    },
  }
  // `${
  //   props.hasAttachment}` &&
  //   css`
  //     marginTop: '16px'
  //   }

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
      style={{ ...extraStyle, ...MentionsInputStyle }}
    >
      <Mention
        appendSpaceOnAdd
        data={searchUsers}
        displayTransform={username => `@${username}`}
        markup="@[__id__]"
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
