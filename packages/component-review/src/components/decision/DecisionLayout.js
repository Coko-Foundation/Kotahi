import React from 'react'
import moment from 'moment'
// import classnames from 'classnames'
// import SimpleEditor from 'pubsweet-component-wax/src/SimpleEditor'
import classes from './DecisionLayout.local.scss'
import DecisionForm from './DecisionForm'
import DecisionReviews from './DecisionReviews'
import ReviewMetadata from '../metadata/ReviewMetadata'
import Decision from './Decision'
import Tabs from '../tabs/Tabs'

const DecisionLayout = ({ project, versions, valid, handleSubmit, uploadFile }) => {
  const decisionSections = []
  const editorSections = []

  versions.forEach(version => {
    // TODO: allow multiple decisions, e.g. appeals
    const decision = version.decision

    if (decision && decision.submitted) {
      const key = moment(decision.submitted).format('YYYY-MM-DD')

      decisionSections.push({
        key,
        content: (
          <div>
            <ReviewMetadata version={version}/>
            <DecisionReviews version={version}/>
            <Decision decision={decision}/>
          </div>
        ),
      })

      editorSections.push({
        key,
        content: <div>TODO</div>
        // editor: <SimpleEditor book={project} fragment={version}/>
      })
    }
  }, [])

  const version = versions[versions.length - 1]
  const decision = version.decision

  if (!decision || !decision.submitted) {
    const key = moment().format('YYYY-MM-DD')

    decisionSections.push({
      key,
      content: (
        <div>
          <ReviewMetadata
            version={version}/>
          <DecisionReviews
            version={version}/>
          <DecisionForm
            decision={decision}
            valid={valid}
            handleSubmit={handleSubmit}
            uploadFile={uploadFile}/>
        </div>
      )
    })

    editorSections.push({
      key,
      editor: <div>TODO</div>
      // editor: <SimpleEditor book={project} fragment={version}/>
    })
  }

  const activeKey = decisionSections[decisionSections.length - 1].key

  return (
    <div className={classes.root}>
      <div className={classes.column}>
        <Tabs
          sections={editorSections}
          activeKey={activeKey}
          title="Versions"/>
      </div>

      <div className={classes.column}>
        <Tabs
          sections={decisionSections}
          activeKey={activeKey}
          title="Versions"/>
      </div>
    </div>
  )
}

export default DecisionLayout
