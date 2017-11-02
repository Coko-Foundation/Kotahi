import React from 'react'
import HtmlViewer from '../HtmlViewer'
import * as options from './config'

const NoteViewer = ({ className, value }) => (
  <HtmlViewer
    className={className}
    value={value}
    options={options}
  />
)

export default NoteViewer
