import React from 'react'
import moment from 'moment'
// import classnames from 'classnames'
import SimpleEditor from 'wax-editor-react'
import ReviewForm from './ReviewForm'
import ReviewMetadata from '../metadata/ReviewMetadata'
import Review from './Review'
import Tabs from '../tabs/Tabs'
import classes from './ReviewLayout.local.scss'

const ReviewLayout = ({
  project,
  versions,
  currentVersion,
  handlingEditors,
  reviewer,
  valid,
  handleSubmit,
  uploadFile,
}) => {
  const reviewSections = []
  const editorSections = []

  versions.forEach(version => {
    let review
    if (version.reviewers) {
      review = version.reviewers.find(
        review => review.reviewer === reviewer._reviewer.id,
      )
    }

    if (review && review.submitted) {
      const submittedMoment = moment(review.submitted)
      const key = submittedMoment.format('x')
      const label = submittedMoment.format('YYYY-MM-DD')

      reviewSections.push({
        content: (
          <div>
            <ReviewMetadata
              handlingEditors={handlingEditors}
              version={version}
            />
            <Review review={review} />
          </div>
        ),
        key,
        label,
      })

      // TODO: need to include unreviewed versions?
      editorSections.push({
        content: (
          <SimpleEditor
            content={version.source}
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

  const review = currentVersion.reviewers.find(
    review => review.reviewer === reviewer.id,
  )

  if (!review || !review.submitted) {
    const submittedMoment = moment()
    const key = submittedMoment.format('x')
    const label = submittedMoment.format('YYYY-MM-DD')

    reviewSections.push({
      content: (
        <div>
          <ReviewMetadata
            handlingEditors={handlingEditors}
            version={currentVersion}
          />
          <ReviewForm
            handleSubmit={handleSubmit}
            review={review}
            uploadFile={uploadFile}
            valid={valid}
          />
        </div>
      ),
      key,
      label,
    })

    editorSections.push({
      content: (
        <SimpleEditor
          content={currentVersion.source}
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
    <div className={classes.root}>
      <div className={classes.manuscript}>
        <Tabs
          activeKey={editorSections[editorSections.length - 1].key}
          sections={editorSections}
          title="Versions"
        />
      </div>

      <div className={classes.review}>
        <Tabs
          activeKey={reviewSections[reviewSections.length - 1].key}
          sections={reviewSections}
          title="Versions"
        />
      </div>
    </div>
  )
}

export default ReviewLayout
