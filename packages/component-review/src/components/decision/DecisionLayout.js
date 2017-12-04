import React from 'react'
import moment from 'moment'
// import classnames from 'classnames'
import SimpleEditor from 'wax-editor-react'
import classes from './DecisionLayout.local.scss'
import DecisionForm from './DecisionForm'
import DecisionReviews from './DecisionReviews'
import ReviewMetadata from '../metadata/ReviewMetadata'
import Decision from './Decision'
import Tabs from '../tabs/Tabs'

const DecisionLayout = ({
  project,
  versions,
  currentVersion,
  valid,
  handleSubmit,
  uploadFile,
}) => {
  const decisionSections = []
  const editorSections = []

  versions.forEach(version => {
    // TODO: allow multiple decisions, e.g. appeals
    const decision = version.decision

    if (decision && decision.submitted) {
      const submittedMoment = moment(decision.submitted)
      const key = submittedMoment.format('x')
      const label = submittedMoment.format('YYYY-MM-DD')

      decisionSections.push({
        key,
        label,
        content: (
          <div>
            <ReviewMetadata version={version} />
            <DecisionReviews version={version} />
            <Decision decision={decision} />
          </div>
        ),
      })

      editorSections.push({
        key,
        label,
        content: (
          <SimpleEditor
            content={version.source}
            layout="bare"
            readOnly={true}
          />
        ),
      })
    }
  }, [])

  const decision = currentVersion.decision

  if (!decision || !decision.submitted) {
    const submittedMoment = moment()
    const key = submittedMoment.format('x')
    const label = submittedMoment.format('YYYY-MM-DD')

    decisionSections.push({
      key,
      label,
      content: (
        <div>
          <ReviewMetadata version={currentVersion} />
          <DecisionReviews version={currentVersion} />
          <DecisionForm
            decision={decision}
            valid={valid}
            handleSubmit={handleSubmit}
            uploadFile={uploadFile}
          />
        </div>
      ),
    })

    editorSections.push({
      key,
      label,
      content: (
        <SimpleEditor
          content={currentVersion.source}
          layout="bare"
          readOnly={true}
        />
      ),
    })
  }

  return (
    <div className={classes.root}>
      <div className={classes.column}>
        <Tabs
          sections={editorSections}
          activeKey={editorSections[editorSections.length - 1].key}
          title="Versions"
        />
      </div>

      <div className={classes.column}>
        <Tabs
          sections={decisionSections}
          activeKey={decisionSections[decisionSections.length - 1].key}
          title="Versions"
        />
      </div>
    </div>
  )
}

export default DecisionLayout
