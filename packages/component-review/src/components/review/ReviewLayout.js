import React from 'react'
import moment from 'moment'
// import classnames from 'classnames'
import SimpleEditor from 'wax-editor-react'
import ReviewForm from './ReviewForm'
import ReviewMetadata from '../metadata/ReviewMetadata'
import Review from './Review'
import Tabs from '../tabs/Tabs'
import classes from './ReviewLayout.local.scss'

const ReviewLayout = ({ project, versions, currentVersion, handlingEditors, reviewer, valid, handleSubmit, uploadFile }) => {
  const reviewSections = []
  const editorSections = []

  versions.forEach(version => {
    const review = version.reviewers.find(review => review.reviewer === reviewer.id)

    if (review && review.submitted) {
      const submittedMoment = moment(review.submitted)
      const key = submittedMoment.format('x')
      const label = submittedMoment.format('YYYY-MM-DD')

      reviewSections.push({
        key,
        label,
        content: (
          <div>
            <ReviewMetadata
              version={version}
              handlingEditors={handlingEditors}/>
            <Review
              review={review}/>
          </div>
        ),
      })

      // TODO: need to include unreviewed versions?
      editorSections.push({
        key,
        label,
        content: <SimpleEditor
          content={version.source}
          layout="bare"
          readOnly={true}/>
      })
    }
  }, [])

  const review = currentVersion.reviewers.find(
    review => review.reviewer === reviewer.id
  )

  if (!review || !review.submitted) {
    const submittedMoment = moment()
    const key = submittedMoment.format('x')
    const label = submittedMoment.format('YYYY-MM-DD')

    reviewSections.push({
      key,
      label,
      content: (
        <div>
          <ReviewMetadata
            version={currentVersion}
            handlingEditors={handlingEditors}/>
          <ReviewForm
            review={review}
            valid={valid}
            handleSubmit={handleSubmit}
            uploadFile={uploadFile}/>
        </div>
      )
    })

    editorSections.push({
      key,
      label,
      content: <SimpleEditor
        layout="bare"
        content={currentVersion.source}
        readOnly={true}/>
    })
  }

  return (
    <div className={classes.root}>
      <div className={classes.manuscript}>
        <Tabs
          sections={editorSections}
          activeKey={editorSections[editorSections.length - 1].key}
          title="Versions"/>
      </div>

      <div className={classes.review}>
        <Tabs
          sections={reviewSections}
          activeKey={reviewSections[reviewSections.length - 1].key}
          title="Versions"/>
      </div>
    </div>
  )
}

export default ReviewLayout
