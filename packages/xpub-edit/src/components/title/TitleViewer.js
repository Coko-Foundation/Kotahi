import React from 'react'
import { converter, schema } from './config'
import Viewer from '../Viewer'
import classes from './TitleViewer.local.scss'

const TitleViewer = ({ value }) => (
  <Viewer
    className={classes.root}
    value={value}
    converter={converter}
    schema={schema}/>
)

export default TitleViewer
