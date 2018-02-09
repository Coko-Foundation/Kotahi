import React from 'react'
import { Button } from '@pubsweet/ui'
import { getReviewerFromUser } from 'xpub-selectors'
import classes from './Item.local.scss'
import ProjectLink from '../ProjectLink'
import Divider from './Divider'
import VersionTitle from './VersionTitle'

// TODO: only return links if version id is in reviewer.accepted array
// TODO: only return actions if not accepted or rejected
// TODO: review id in link

const ReviewerItem = ({ project, version, currentUser, reviewerResponse }) => {
  const reviewer = getReviewerFromUser(project, version, currentUser)

  return (
    <div className={classes.root}>
      <div className={classes.main}>
        <VersionTitle className={classes.versionTitle} version={version} />

        {reviewer && (
          <div className={classes.links}>
            {(reviewer.status === 'accepted' ||
              reviewer.status === 'completed') && (
              <div className={classes.links}>
                <div className={classes.link}>
                  <ProjectLink
                    id={reviewer.id}
                    page="reviews"
                    project={project}
                    version={version}
                  >
                    {reviewer.submitted ? 'Completed' : 'Do Review'}
                  </ProjectLink>
                </div>
              </div>
            )}

            {reviewer.status === 'invited' && (
              <div className={classes.actions}>
                <div className={classes.action}>
                  <Button
                    onClick={() =>
                      reviewerResponse(project, version, reviewer, 'accepted')
                    }
                  >
                    accept
                  </Button>
                </div>

                <Divider separator="|" />

                <div className={classes.action}>
                  <Button
                    onClick={() =>
                      reviewerResponse(project, version, reviewer, 'rejected')
                    }
                  >
                    reject
                  </Button>
                </div>
              </div>
            )}
            {reviewer.status === 'rejected' && 'rejected'}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewerItem
