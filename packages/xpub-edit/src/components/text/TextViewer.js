import React from 'react'
import HtmlViewer from '../HtmlViewer'

import * as options from './config'

const TextViewer = ({ className, value }) => (
  <HtmlViewer className={className} value={value} options={options} />
)

export default TextViewer
