import React from 'react'
import { converter } from './config'
import Viewer from '../Viewer'

const TextViewer = ({ value }) => (
  <Viewer
    value={value}
    converter={converter}/>
)

export default TextViewer
