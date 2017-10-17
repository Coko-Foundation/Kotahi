import React from 'react'
import { converter } from './config'
import Viewer from '../Viewer'

const TextViewer = ({ className, value }) => (
  <Viewer
    className={className}
    value={value}
    converter={converter}/>
)

export default TextViewer
