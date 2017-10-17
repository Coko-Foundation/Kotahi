import React from 'react'
import { converter, schema } from './config'
import Viewer from '../Viewer'

const NoteViewer = ({ className, value }) => (
  <Viewer
    className={className}
    value={value}
    converter={converter}
    schema={schema}/>
)

export default NoteViewer
