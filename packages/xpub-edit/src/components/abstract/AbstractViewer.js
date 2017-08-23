import React from 'react'
import { converter, schema } from './config'
import Viewer from '../Viewer'

const AbstractViewer = ({ value }) => (
  <Viewer
    value={value}
    converter={converter}
    schema={schema}/>
)

export default AbstractViewer
