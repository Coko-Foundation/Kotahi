import React from 'react'
import moment from 'moment'
// import classnames from 'classnames'
import SimpleEditor from 'wax-editor-react'
import ReviewForm from './ReviewForm'
import ReviewMetadata from '../metadata/ReviewMetadata'
import Review from './Review'
import Tabs from '../tabs/Tabs'
import classes from './ReviewLayout.local.scss'

const ReviewLayout = ({ project, versions, reviewer, valid, handleSubmit, uploadFile }) => {
  const reviewSections = []
  const editorSections = []

  versions.forEach(version => {
    const review = version.reviews.find(review => review.reviewer === reviewer.id)

    if (review && review.events.reviewed) {
      const key = moment(review.events.reviewed).format('YYYY-MM-DD')

      reviewSections.push({
        key,
        content: (
          <div>
            <ReviewMetadata version={version}/>
            <Review review={review}/>
          </div>
        ),
      })

      // TODO: need to include unreviewed versions?
      editorSections.push({
        key,
        content: <SimpleEditor
          content={version.source}
          layout="bare"
          readOnly={true}/>
      })
    }
  }, [])

  const version = versions[versions.length - 1]
  const review = version.reviews.find(review => review.reviewer === reviewer.id)

  if (!review || !review.submitted) {
    const key = moment().format('YYYY-MM-DD')

    reviewSections.push({
      key,
      content: (
        <div>
          <ReviewMetadata
            version={version}/>
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
      content: <SimpleEditor content={version.source} readOnly={true}/>
    })
  }

  const activeKey = reviewSections[reviewSections.length - 1].key

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
          sections={reviewSections}
          activeKey={activeKey}
          title="Versions"/>
      </div>
    </div>
  )
}

export default ReviewLayout
