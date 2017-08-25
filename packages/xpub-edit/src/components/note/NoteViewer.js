import React from 'react'
import { converter, schema } from './config'
import Viewer from '../Viewer'

const NoteViewer = ({ value }) => (
  <Viewer
    value={value}
    converter={converter}
    schema={schema}/>
)

export default NoteViewer
