import React from 'react'
import HtmlViewer from '../HtmlViewer'
import * as options from './config'

const TitleViewer = ({ className, value }) => (
  <HtmlViewer className={className} options={options} value={value} />
)

export default TitleViewer
