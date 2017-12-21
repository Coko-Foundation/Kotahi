import React from 'react'
import { AbstractViewer, TitleViewer } from 'xpub-edit'
import classes from './Metadata.local.scss'

const Metadata = ({ version }) => (
  <div className={classes.root}>
    <TitleViewer className={classes.title} value={version.metadata.title} />

    <div className={classes.authors}>{version.metadata.authors.join(', ')}</div>

    <AbstractViewer
      className={classes.abstract}
      value={version.metadata.abstract}
    />
  </div>
)

export default Metadata
