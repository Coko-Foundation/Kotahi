import React from 'react'
import { Button } from 'xpub-ui'
import classes from './Item.local.scss'
import ProjectLink from '../ProjectLink'
import Divider from './Divider'

// TODO: only return links if version id is in reviewer.accepted array
// TODO: only return actions if not accepted or declined
// TODO: review id in link

const ReviewerItem = ({ project, version, reviewerResponse }) => (
  <div className={classes.root}>
    <div className={classes.main}>
      <div className={classes.title}>
        {project.title || 'Untitled'}
      </div>

      <div className={classes.links}>
        <div className={classes.link}>
          <ProjectLink
            project={project}
            version={version}
            page="reviews"
            id={project.id}>Do Review</ProjectLink>
        </div>
      </div>

      <div className={classes.actions}>
        <div className={classes.action}>
          <Button onClick={() => reviewerResponse(version.id, true)}>accept</Button>
        </div>

        <Divider separator="|"/>

        <div className={classes.action}>
          <Button onClick={() => reviewerResponse(version.id, false)}>reject</Button>
        </div>
      </div>
    </div>
  </div>
)

export default ReviewerItem
