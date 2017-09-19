import React from 'react'
import classes from './Reviewers.local.scss'

const ReviewersLayout = ({ Form, Item, project, version, reviewers, projectReviewers, reviewerUsers }) => (
  <div className={classes.root}>
    <div className={classes.form}>
      <Form
        project={project}
        version={version}
        reviewerUsers={reviewerUsers}
        projectReviewers={projectReviewers}/>
    </div>

    {reviewers && (
      <div className={classes.reviewers}>
        {reviewers.map(reviewer => (
          <Item
            key={reviewer.id}
            project={project}
            reviewer={reviewer}/>
        ))}
      </div>
    )}
  </div>
)

export default ReviewersLayout
