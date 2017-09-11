import React from 'react'
// import classnames from 'classnames'
// import SimpleEditor from 'pubsweet-component-wax/src/SimpleEditor'
import classes from './ReviewLayout.local.scss'
import ReviewForm from './ReviewForm'
import ReviewMetadata from './ReviewMetadata'

const ReviewLayout = ({ project, version, review, valid, handleSubmit, uploadFile }) => (
  <div className={classes.root}>
    <div className={classes.column}>
      {/*<SimpleEditor
        book={project}
        fragment={version}
      />*/}
    </div>

    <div className={classes.column}>
      <ReviewMetadata version={version}/>
      <ReviewForm valid={valid} handleSubmit={handleSubmit} uploadFile={uploadFile}/>
    </div>
  </div>
)

export default ReviewLayout
