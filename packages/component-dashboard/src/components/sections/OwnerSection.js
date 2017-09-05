import React from 'react'
import DashboardSection from '../DashboardSection'
import EmptySubmissions from '../EmptySubmissions'

const OwnerSection = ({ projects, deleteProject, projectRoute }) => (
  <DashboardSection
    heading="My Submissions"
    projects={projects}
    empty={EmptySubmissions}
    links={project => [
      {
        url: projectRoute(project, 'submit'),
        name: 'Submission'
      },
      {
        url: projectRoute(project, 'manuscript'),
        name: 'Manuscript'
      }
    ]}
    actions={project => [
      {
        key: 'delete',
        content: <button onClick={() => deleteProject({ id: project.id })}>x</button>
      }
    ]}/>
)

export default OwnerSection
