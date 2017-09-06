import React from 'react'
import ProjectLink from '../ProjectLink'
import DashboardSection from '../DashboardSection'
import EmptySubmissions from '../EmptySubmissions'

const OwnerSection = ({ projects, deleteProject, projectRoute }) => (
  <DashboardSection
    heading="My Submissions"
    projects={projects}
    empty={EmptySubmissions}
    links={(project, version) => [
      {
        key: 'submit',
        content: (
          <ProjectLink
            project={project}
            version={version}
            page="submit">Submission</ProjectLink>
        )
      },
      {
        key: 'manuscript',
        content: (
          <ProjectLink
            project={project}
            version={version}
            page="manuscript">Manuscript</ProjectLink>
        )
      }
    ]}
    actions={project => [
      {
        key: 'delete',
        content: (
          <button onClick={() => deleteProject({ id: project.id })}>x</button>
        )
      }
    ]}/>
)

export default OwnerSection
