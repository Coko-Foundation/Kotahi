import React from 'react'
import moment from 'moment'
// import classnames from 'classnames'
import { Link } from 'react-router-dom'
import SimpleEditor from 'wax-editor-react'
import classes from './DecisionLayout.local.scss'
import DecisionForm from './DecisionForm'
import DecisionReviews from './DecisionReviews'
import ReviewMetadata from '../metadata/ReviewMetadata'
import Decision from './Decision'
import Tabs from '../tabs/Tabs'

// TODO -- is passing arrays of react components as props an ok practice?
/*
  TODO -- should we make an editor for each tab, or should we just rerender
          the same one with different content?
*/

const DecisionLayout = ({
  currentVersion,
  handleSubmit,
  project,
  uploadFile,
  valid,
  versions,
}) => {
  const decisionSections = []
  const editorSections = []

  versions.forEach(version => {
    // TODO: allow multiple decisions, e.g. appeals
    const { decision } = version
    if (decision && decision.submitted) {
      const submittedMoment = moment(decision.submitted)
      // const key = submittedMoment.format('x')
      const label = submittedMoment.format('YYYY-MM-DD')

      decisionSections.push({
        content: (
          <div>
            <ReviewMetadata version={version} />
            <DecisionReviews version={version} />
            <Decision decision={decision} />
          </div>
        ),
        key: version.id,
        label,
      })

      editorSections.push({
        content: (
          <SimpleEditor
            content={version.source}
            editing="selection"
            key={version.id}
            layout="bare"
            readOnly
          />
        ),
        key: version.id,
        label,
      })
    }
  }, [])

  const { decision } = currentVersion

  if (currentVersion.submitted && (!decision || !decision.submitted)) {
    const submittedMoment = moment()
    // const key = submittedMoment.format('x')
    const label = submittedMoment.format('YYYY-MM-DD')
    decisionSections.push({
      content: (
        <div>
          <ReviewMetadata version={currentVersion} />
          <Link
            to={`/projects/${project.id}/versions/${
              currentVersion.id
            }/reviewers`}
          >
            Assign Reviewers
          </Link>
          <DecisionReviews version={currentVersion} />
          <DecisionForm
            decision={decision}
            handleSubmit={handleSubmit}
            uploadFile={uploadFile}
            valid={valid}
          />
        </div>
      ),
      key: currentVersion.id,
      label,
    })

    editorSections.push({
      content: (
        <SimpleEditor
          content={currentVersion.source}
          editing="selection"
          key={currentVersion.id}
          layout="bare"
          readOnly
        />
      ),
      key: currentVersion.id,
      label,
    })
  }

  return (
    <div className={classes.root}>
      <div className={classes.column}>
        <Tabs
          activeKey={editorSections[editorSections.length - 1].key}
          sections={editorSections}
          title="Versions"
        />
      </div>
      <div className={classes.column}>
        <Tabs
          activeKey={decisionSections[decisionSections.length - 1].key}
          sections={decisionSections}
          title="Versions1"
        />
      </div>
    </div>
  )
}

export default DecisionLayout
