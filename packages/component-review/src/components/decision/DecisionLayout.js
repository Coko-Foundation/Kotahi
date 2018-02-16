import React from 'react'
import moment from 'moment'
import { Link } from 'react-router-dom'
import SimpleEditor from 'wax-editor-react'

import DecisionForm from './DecisionForm'
import DecisionReviews from './DecisionReviews'
import ReviewMetadata from '../metadata/ReviewMetadata'
import Decision from './Decision'
import { Columns, Manuscript, Admin } from '../atoms/Columns'
import AdminSection from '../atoms/AdminSection'
import Tabs from '../atoms/Tabs'

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
      const key = submittedMoment.format('x')
      const label = submittedMoment.format('YYYY-MM-DD')

      decisionSections.push({
        content: (
          <div>
            <ReviewMetadata version={version} />
            <DecisionReviews version={version} />
            <Decision decision={decision} />
          </div>
        ),
        key,
        label,
      })

      editorSections.push({
        content: (
          <SimpleEditor
            content={version.source}
            editing="selection"
            key={key}
            layout="bare"
            readOnly
          />
        ),
        key,
        label,
      })
    }
  }, [])

  const { decision } = currentVersion

  if (currentVersion.submitted && (!decision || !decision.submitted)) {
    const submittedMoment = moment()
    const key = submittedMoment.format('x')
    const label = submittedMoment.format('YYYY-MM-DD')
    decisionSections.push({
      content: (
        <div>
          <AdminSection>
            <ReviewMetadata version={currentVersion} />
          </AdminSection>
          <AdminSection>
            <Link
              to={`/projects/${project.id}/versions/${
                currentVersion.id
              }/reviewers`}
            >
              Assign Reviewers
            </Link>
          </AdminSection>
          <AdminSection>
            <DecisionReviews version={currentVersion} />
          </AdminSection>
          <AdminSection>
            <DecisionForm
              decision={decision}
              handleSubmit={handleSubmit}
              uploadFile={uploadFile}
              valid={valid}
            />
          </AdminSection>
        </div>
      ),
      key,
      label,
    })

    editorSections.push({
      content: (
        <SimpleEditor
          content={currentVersion.source}
          editing="selection"
          key={key}
          layout="bare"
          readOnly
        />
      ),
      key,
      label,
    })
  }

  return (
    <Columns>
      <Manuscript>
        <Tabs
          activeKey={editorSections[editorSections.length - 1].key}
          sections={editorSections}
          title="Versions"
        />
      </Manuscript>

      <Admin>
        <Tabs
          activeKey={decisionSections[decisionSections.length - 1].key}
          sections={decisionSections}
          title="Versions"
        />
      </Admin>
    </Columns>
  )
}

export default DecisionLayout
