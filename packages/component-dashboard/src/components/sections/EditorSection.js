import React from 'react'
import MetadataSections from '../metadata/MetadataSections'
import MetadataReviewType from '../metadata/MetadataReviewType'
import MetadataSubmittedDate from '../metadata/MetadataSubmittedDate';
import MetadataOwners from '../metadata/MetadataOwners';
import AssignEditor from '../AssignEditor'
import DashboardSection from '../DashboardSection'
import ProjectLink from '../ProjectLink';

const EditorSection = ({ projects, teams, reviewerResponse, addUserToTeam, projectRoute }) => (
  <DashboardSection
    heading="My Manuscripts"
    projects={projects}
    links={(project, version) => [
      {
        key: 'assign',
        content: (
          <ProjectLink
            project={project}
            version={version}
            page="reviewers">Assign Reviewers</ProjectLink>
        )
      },
    ]}
    meta={(project, version) => {
      return [
        {
          key: 'owner',
          content: (
            <MetadataOwners owners={project.owners}/>
          )
        },
        {
          key: 'submitted',
          content: (
            <MetadataSubmittedDate submitted={version.submitted}/>
          )
        },
        {
          key: 'section',
          content: (
            <MetadataSections sections={version.metadata.articleSection}/>
          )
        },
        {
          key: 'openReview',
          content: (
            <MetadataReviewType openReview={version.declarations.openReview}/>
          )
        }
      ]
    }}
    roles={(project) => {
      const projectTeams = teams.filter(team => {
        return team.object.type === 'collection'
          && team.object.id === project.id
      })

      // TODO: only show the menu if editable
      return [
        {
          role: 'senior-editor',
          content: (
            <AssignEditor
              project={project}
              team={projectTeams.find(team => team.teamType === 'seniorEditor')}
              teamType="seniorEditor"
              addUserToTeam={addUserToTeam}
            />
          )
        }
      ]
    }}
  />
)

export default EditorSection
