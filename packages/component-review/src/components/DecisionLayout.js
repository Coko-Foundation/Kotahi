import React from 'react'
// import classnames from 'classnames'
// import SimpleEditor from 'pubsweet-component-wax/src/SimpleEditor'
import classes from './DecisionLayout.local.scss'
import Decision from './Decision'
import Reviews from './Reviews'

const DecisionLayout = ({ project, version, decision, valid, handleSubmit, uploadFile }) => (
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

      <Reviews version={version}/>

      <Decision valid={valid} handleSubmit={handleSubmit} uploadFile={uploadFile}/>
    </div>
  </div>
)

export default DecisionLayout
