import React from 'react'
import classes from './Reviewers.local.scss'

const Reviewers = ({ ReviewerForm, Reviewer, project, version, reviewers, reviewerUsers }) => (
  <div className={classes.root}>
    <div className={classes.form}>
      <ReviewerForm
        project={project}
        version={version}
        reviewerUsers={reviewerUsers}/>
    </div>

    {reviewers && (
      <div className={classes.reviewers}>
        {reviewers.map(reviewer => (
          <Reviewer
            key={reviewer.id}
            project={project}
            reviewer={reviewer}/>
        ))}
      </div>
    )}
  </div>
)

export default Reviewers
