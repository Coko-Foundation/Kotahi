import React from 'react'
import { Link } from 'react-router-dom'
import classes from './Reviewers.local.scss'

const Reviewers = ({
  ReviewerForm,
  Reviewer,
  project,
  version,
  reviewers,
  reviewerUsers,
}) => (
  <div className={classes.root}>
    <div className={classes.form}>
      <ReviewerForm
        project={project}
        reviewerUsers={reviewerUsers}
        version={version}
      />

      {/* <div className={classes.find}>
          <Link
            to={`/projects/${project.id}/versions/${version.id}/find-reviewers`}
            >
              Find reviewers
          </Link>
        </div> */}
    </div>

    <div className={classes.reviewers}>
      {reviewers &&
        reviewers.map(reviewer => (
          <Reviewer key={reviewer.id} project={project} reviewer={reviewer} />
        ))}
    </div>
  </div>
)

export default Reviewers
