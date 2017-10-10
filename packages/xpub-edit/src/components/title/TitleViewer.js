import React from 'react'
import { converter, schema } from './config'
import Viewer from '../Viewer'

const TitleViewer = ({ value }) => (
  <Viewer
    value={value}
    converter={converter}
    schema={schema}/>
)

export default TitleViewer
