/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */

// @flow
import * as React from 'react'
import { Button } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import styled from 'styled-components'
import { Icon } from '../../../shared'
import {
  Form,
  ChatInputContainer,
  ChatInputWrapper,
  InputWrapper,
  PhotoSizeError,
  PreviewWrapper,
  RemovePreviewButton,
} from './style'
import MentionsInput from '../MentionsInput/MentionsInput'

import { useAppScroller } from '../../../../hooks/useAppScroller'
import { MEDIA_BREAK } from '../../../layout'

const MarkdownHint = styled.div`
  color: ${th('colorTextPlaceholder')};
  font-size: 12px;
  line-height: 1;
  min-height: 1em;
  padding-left: 16px;
`

const QuotedMessage = styled.div``

export const cleanSuggestionUserObject = user => {
  if (!user) return null
  return {
    ...user,
    id: user.username,
    display: user.username,
    filterName: user.name.toLowerCase(),
  }
}

const SuperChatInput = props => {
  const { sendChannelMessages, searchUsers } = props

  const cacheKey = `last-content-${props.channelId}`
  const [text, changeText] = React.useState('')
  const [photoSizeError, setPhotoSizeError] = React.useState('')
  const [inputRef, setInputRef] = React.useState(null)
  const { scrollToBottom } = useAppScroller()

  // On mount, set the text state to the cached value if one exists
  // $FlowFixMe
  React.useEffect(() => {
    changeText(localStorage.getItem(cacheKey) || '')
    // NOTE(@mxstbr): We ONLY want to run this if we switch between threads, never else!
  }, [props.threadId])

  // Cache the latest text everytime it changes
  // $FlowFixMe
  React.useEffect(() => {
    localStorage.setItem(cacheKey, text)
  }, [text])

  // Focus chatInput when quoted message changes
  // $FlowFixMe
  React.useEffect(() => {
    if (inputRef) inputRef.focus()
  }, [props.quotedMessage && props.quotedMessage.messageId])

  React.useEffect(() => {
    // autofocus the chat input on desktop
    if (inputRef && window && window.innerWidth > MEDIA_BREAK) inputRef.focus()
  }, [inputRef])

  const removeAttachments = () => {
    removeQuotedMessage()
    setMediaPreview(null)
  }

  const handleKeyPress = e => {
    // We shouldn't do anything during composition of IME.
    // `keyCode === 229` is a fallback for old browsers like IE.
    if (e.isComposing || e.keyCode === 229) {
      return
    }

    switch (e.key) {
      // Submit on Enter unless Shift is pressed
      case 'Enter': {
        if (e.shiftKey) return
        e.preventDefault()
        submit()
        return
      }

      // If backspace is pressed on the empty
      case 'Backspace': {
        if (text.length === 0) removeAttachments()
        break
      }

      default:
    }
  }

  const onChange = e => {
    const textValue = e.target.value
    changeText(textValue)
  }

  const sendMessage = ({ file, body }) =>
    // user is creating a new directMessageThread, break the chain
    // and initiate a new group creation with the message being sent
    // in views/directMessages/containers/newThread.js
    // if (props.threadId === 'newDirectMessageThread') {
    //   return props.createThread({
    //     messageType: file ? 'media' : 'text',
    //     file,
    //     messageBody: body,
    //   })
    // }

    sendChannelMessages({ content: body, channelId: props.channelId })
  // const method =
  //   props.threadType === 'story' ? props.sendMessage : props.sendDirectMessage
  // return method({
  //   threadId: props.threadId,
  //   messageType: file ? 'media' : 'text',
  //   threadType: props.threadType,
  //   parentId: props.quotedMessage,
  //   content: {
  //     body,
  //   },
  //   file,
  // })

  const submit = async e => {
    if (e) e.preventDefault()

    if (!props.networkOnline) {
      console.error('No internet')
      // return props.dispatch(
      //   addToastWithTimeout(
      //     'error',
      //     'Not connected to the internet - check your internet connection or try again',
      //   ),
      // )
    }

    if (
      props.websocketConnection !== 'connected' &&
      props.websocketConnection !== 'reconnected'
    ) {
      console.error('No internet, reconnecting.')
      // return props.dispatch(
      //   addToastWithTimeout(
      //     'error',
      //     'Error connecting to the server - hang tight while we try to reconnect',
      //   ),
      // )
    }

    scrollToBottom()

    if (mediaFile) {
      setIsSendingMediaMessage(true)
      scrollToBottom()
      await sendMessage({
        file: mediaFile,
        body: '{"blocks":[],"entityMap":{}}',
      })
        .then(() => {
          setIsSendingMediaMessage(false)
          setMediaPreview(null)
          setAttachedMediaFile(null)
        })
        .catch(_ => {
          setIsSendingMediaMessage(false)
          // props.dispatch(addToastWithTimeout('error', err.message))
        })
    }

    if (text.length === 0) return

    // workaround react-mentions bug by replacing @[username] with @username
    // @see withspectrum/spectrum#4587
    sendMessage({ body: text.replace(/@\[([a-z0-9_-]+)\]/g, '@$1') })
    // .then(() => {
    //   // If we're viewing a thread and the user sends a message as a non-member, we need to refetch the thread data
    //   if (
    //     props.threadType === 'story' &&
    //     props.threadId &&
    //     props.refetchThread
    //   ) {
    //     return props.refetchThread();
    //   }
    // })
    // .catch(err => {
    // props.dispatch(addToastWithTimeout('error', err.message));
    // })

    // Clear the chat input now that we're sending a message for sure
    onChange({ target: { value: '' } })
    removeQuotedMessage()
    inputRef && inputRef.focus()
  }

  // $FlowFixMe
  // eslint-disable-next-line no-unused-vars
  const [isSendingMediaMessage, setIsSendingMediaMessage] = React.useState(
    false,
  )

  // $FlowFixMe
  const [mediaPreview, setMediaPreview] = React.useState(null)
  // $FlowFixMe
  const [mediaFile, setAttachedMediaFile] = React.useState(null)

  // const previewMedia = blob => {
  //   if (isSendingMediaMessage) return
  //   setIsSendingMediaMessage(true)
  //   setAttachedMediaFile(blob)
  //   inputRef && inputRef.focus()

  //   const reader = new FileReader()
  //   reader.onload = () => {
  //     setMediaPreview(reader.result.toString())
  //     setIsSendingMediaMessage(false)
  //   }

  //   if (blob) {
  //     reader.readAsDataURL(blob)
  //   }
  // }

  const removeQuotedMessage = () => {
    // if (props.quotedMessage)
    //   props.dispatch(
    //     replyToMessage({ threadId: props.threadId, messageId: null }),
    //   )
  }

  const networkDisabled =
    !props.networkOnline ||
    (props.websocketConnection !== 'connected' &&
      props.websocketConnection !== 'reconnected')

  return (
    <>
      <ChatInputContainer>
        {photoSizeError && (
          <PhotoSizeError>
            <p>{photoSizeError}</p>
            <Icon
              color="warn.default"
              glyph="view-close"
              onClick={() => setPhotoSizeError('')}
              size={16}
            />
          </PhotoSizeError>
        )}
        <ChatInputWrapper>
          {/* {props.currentUser && (
            <MediaUploader
              currentUser={props.currentUser}
              isSendingMediaMessage={isSendingMediaMessage}
              onError={err => setPhotoSizeError(err)}
              onValidated={previewMedia}
            />
          )} */}
          <Form onSubmit={submit}>
            <InputWrapper
              hasAttachment={!!props.quotedMessage || !!mediaPreview}
              networkDisabled={networkDisabled}
            >
              {mediaPreview && (
                <PreviewWrapper>
                  <img alt="" src={mediaPreview} />
                  <RemovePreviewButton onClick={() => setMediaPreview(null)}>
                    <Icon glyph="view-close-small" size="16" />
                  </RemovePreviewButton>
                </PreviewWrapper>
              )}
              {props.quotedMessage && (
                <PreviewWrapper data-cy="staged-quoted-message">
                  <QuotedMessage
                    id={props.quotedMessage}
                    threadId={props.threadId}
                  />
                  <RemovePreviewButton
                    data-cy="remove-staged-quoted-message"
                    onClick={removeQuotedMessage}
                  >
                    <Icon glyph="view-close-small" size="16" />
                  </RemovePreviewButton>
                </PreviewWrapper>
              )}
              <MentionsInput
                autoFocus={false}
                hasAttachment={!!props.quotedMessage || !!mediaPreview}
                inputRef={node => {
                  if (props.onRef) props.onRef(node)
                  setInputRef(node)
                }}
                networkDisabled={networkDisabled}
                // onBlur={props.onBlur}
                onChange={onChange}
                // onFocus={props.onFocus}
                onKeyDown={handleKeyPress}
                placeholder="Your message here..."
                searchUsersCallBack={searchUsers}
                staticSuggestions={props.participants} // props.participants is currently undefined
                value={text}
              />
            </InputWrapper>
            <Button
              data-cy="chat-input-send-button"
              onClick={submit}
              primary
              style={{ flex: 'none', marginLeft: '8px' }}
            >
              Send
            </Button>
          </Form>
        </ChatInputWrapper>
      </ChatInputContainer>
      <MarkdownHint dataCy="markdownHint">
        {text.length > 0 && (
          <span>
            **<strong>bold</strong>**, *<em>italic</em>*, `code`
          </span>
        )}
      </MarkdownHint>
    </>
  )
}

SuperChatInput.defaultProps = {
  networkOnline: true,
  websocketConnection: 'connected',
}

// const map = (state, ownProps) => ({
//   websocketConnection: state.connectionStatus.websocketConnection,
//   networkOnline: state.connectionStatus.networkOnline,
//   quotedMessage: state.message.quotedMessage[ownProps.threadId] || null,
// })

// export default compose(
//   withCurrentUser,
//   sendMessage,
//   sendDirectMessage,
//   // $FlowIssue
//   connect(map)
// )(ChatInput)

export default SuperChatInput
