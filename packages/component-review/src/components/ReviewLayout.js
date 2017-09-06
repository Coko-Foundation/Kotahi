import React from 'react'
// import classnames from 'classnames'
// import SimpleEditor from 'pubsweet-component-wax/src/SimpleEditor'
import classes from './ReviewLayout.local.scss'
import Review from './Review'

const ReviewLayout = ({ project, version, review, valid, pristine, submitting, handleSubmit, uploadFile }) => (
  <div className={classes.root}>
    <div className={classes.column}>
      {/*<SimpleEditor
        book={project}
        fragment={version}
      />*/}
    </div>

    <div className={classes.column}>
      <table className={classes.metadata}>
        <tbody>
        <tr>
          <th>Keywords</th>
          <td>{version.metadata.keywords.join(',')}</td>
        </tr>
        </tbody>
      </table>

      <Review valid={valid} handleSubmit={handleSubmit} uploadFile={uploadFile}/>
    </div>
  </div>
)

export default ReviewLayout
