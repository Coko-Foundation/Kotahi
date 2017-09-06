import React from 'react'
import { Button } from 'xpub-ui'
import DashboardSection from '../DashboardSection'
import ProjectLink from '../ProjectLink'

const ReviewerSection = ({ projects, reviewerResponse, projectRoute }) => (
  <DashboardSection
    heading="My Reviews"
    projects={projects}
    status={false}
    links={(project, version) => [
      // TODO: only return links if version id is in reviewer.accepted array
      {
        key: 'review',
        content: (
          <ProjectLink
            project={project}
            version={version}
            page="reviews"
            id={project.id} // TODO: review id
          >Do Review</ProjectLink>
        )
      }
    ]}
    actions={(project, version) => [
      // TODO: only return actions if not accepted or declined
      {
        key: 'accept',
        content: (
          <Button onClick={() => reviewerResponse(version.id, true)}>accept</Button>
        )
      },
      {
        key: 'decline',
        content: (
          <Button onClick={() => reviewerResponse(version.id, false)}>reject</Button>
        )
      }
    ]}/>
)

export default ReviewerSection
