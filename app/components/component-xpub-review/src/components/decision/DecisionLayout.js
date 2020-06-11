import React from 'react'
import moment from 'moment'

import { Tabs } from '@pubsweet/ui'
import DecisionForm from './DecisionForm'
import DecisionReviews from './DecisionReviews'
import AssignEditorsReviewers from '../assignEditors/AssignEditorsReviewers'
import AssignEditor from '../assignEditors/AssignEditor'
import ReviewMetadata from '../metadata/ReviewMetadata'
import Decision from './Decision'
// import EditorSection from './EditorSection'
import { Columns, Manuscript, Chat } from '../atoms/Columns'
import AdminSection from '../atoms/AdminSection'

// const addEditor = (manuscript, label) => ({
//   content: <EditorSection manuscript={manuscript} />,
//   key: manuscript.id,
//   label,
// })

const DecisionLayout = ({
  handleSubmit,
  updateReview,
  uploadFile,
  manuscript,
  isValid,
}) => {
  const decisionSections = []
  const editorSections = []
  const manuscriptVersions = manuscript.manuscriptVersions || []
  manuscriptVersions.forEach(manuscript => {
    const submittedMoment = moment(manuscript.updated)
    const label = submittedMoment.format('YYYY-MM-DD')

    decisionSections.push({
      content: (
        <div>
          <ReviewMetadata manuscript={manuscript} />
          <DecisionReviews manuscript={manuscript} />
          <Decision
            review={manuscript.reviews.find(review => review.isDecision)}
          />
        </div>
      ),
      key: manuscript.id,
      label,
    })

    // editorSections.push(addEditor(manuscript, label))
  }, [])

  const submittedMoment = moment()
  const label = submittedMoment.format('YYYY-MM-DD')
  if (manuscript.status !== 'revising') {
    decisionSections.push({
      content: (
        <div>
          <AdminSection key="assign-editors">
            <AssignEditorsReviewers
              AssignEditor={AssignEditor}
              manuscript={manuscript}
            />
          </AdminSection>
          <AdminSection key="review-metadata">
            <ReviewMetadata manuscript={manuscript} />
          </AdminSection>
          <AdminSection key="decision-review">
            <DecisionReviews manuscript={manuscript} />
          </AdminSection>
          <AdminSection key="decision-form">
            <DecisionForm
              handleSubmit={handleSubmit}
              isValid={isValid}
              updateReview={updateReview}
              uploadFile={uploadFile}
            />
          </AdminSection>
        </div>
      ),
      key: manuscript.id,
      label,
    })

    // editorSections.push(addEditor(manuscript, label))
  }

  return (
    <Columns>
      <Manuscript>
        Temp
        {/* <Tabs
          activeKey={editorSections[editorSections.length - 1].key}
          sections={editorSections}
          title="Versions"
        /> */}
        <Tabs
          activeKey={decisionSections[decisionSections.length - 1].key}
          sections={decisionSections}
          title="Versions"
        />
      </Manuscript>

      <Chat></Chat>
    </Columns>
  )
}

export default DecisionLayout
