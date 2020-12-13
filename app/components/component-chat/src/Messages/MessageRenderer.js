/* eslint-disable react/prop-types */

import React from 'react'
import ReactMarkdown from 'react-markdown'

const MessageRenderer = React.memo(({ message }) => (
  <ReactMarkdown source={message.content} />
))

export default MessageRenderer
