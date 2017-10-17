import React from 'react'
import { converter, schema } from './config'
import Viewer from '../Viewer'

const TitleViewer = ({ className, value }) => (
  <Viewer
    className={className}
    value={value}
    converter={converter}
    schema={schema}/>
)

export default TitleViewer
