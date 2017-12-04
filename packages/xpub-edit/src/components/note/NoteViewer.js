import React from 'react'
import HtmlViewer from '../HtmlViewer'
import * as options from './config'

const NoteViewer = ({ className, value }) => (
  <HtmlViewer className={className} options={options} value={value} />
)

export default NoteViewer
