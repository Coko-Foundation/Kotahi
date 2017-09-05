import React from 'react'
import DashboardSection from '../DashboardSection'
import { Button } from 'xpub-ui'

const ReviewerSection = ({ projects, reviewerResponse, projectRoute }) => (
  <DashboardSection
    heading="My Reviews"
    projects={projects}
    status={false}
    links={project => {
      // TODO: only return links if version id is in reviewer.accepted array

      return [
        {
          url: projectRoute(project, `review/${project.id}`), // TODO: review id
          name: 'Do Review'
        }
      ]
    }}
    actions={project => {
      // TODO: only return actions if not accepted or declined

      return [
        {
          key: 'accept',
          content: <Button onClick={() => reviewerResponse(project.id, true)}>accept</Button>
        },
        {
          key: 'decline',
          content: <Button onClick={() => reviewerResponse(project.id, false)}>reject</Button>
        }
      ]
    }}/>
)

export default ReviewerSection
