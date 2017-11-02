import React from 'react'
import HtmlViewer from '../HtmlViewer'
import * as options from './config'

const TitleViewer = ({ className, value }) => (
  <HtmlViewer
    options={options}
    className={className}
    value={value}
  />
)

export default TitleViewer
