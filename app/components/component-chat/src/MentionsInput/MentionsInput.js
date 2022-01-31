/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable consistent-return */

// @flow
import React from 'react'
import { MentionsInput, Mention } from 'react-mentions'
import { th } from '@pubsweet/ui-toolkit'
import { MentionsInputStyle } from './style'
import MentionSuggestion from './mentionSuggestion'
import { theme, hexa } from '../SuperChatInput/style'

const CustomMentionsInput = props => {
  const { searchUsersCallBack } = props

  const searchUsers = async () => {
    searchUsersCallBack()
  }

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
