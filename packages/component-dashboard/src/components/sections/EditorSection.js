import React from 'react'
import Moment from 'react-moment'
import { Menu } from 'xpub-ui'
import DashboardSection from '../DashboardSection'

const editorOption = editor => ({
  value: editor.user,
  label: editor.name
})

const EditorSection = ({ journal, projects, reviewerResponse, addUserToTeam, projectRoute }) => (
  <DashboardSection
    heading="My Manuscripts"
    projects={projects}
    links={project => {
      return [
        {
          url: projectRoute(project, 'reviewers'), // TODO: review id
          name: 'Assign Reviewers'
        }
      ]
    }}
    meta={project => {
      const version = project._fragments[0]

      return [
        {
          key: 'owner',
          content: project._owner.name
        },
        {
          key: 'submitted',
          // TODO: format date
          content: (
            <Moment format="YYYY-MM-DD">
              {version.submitted}
            </Moment>
          )
        },
        {
          key: 'section',
          // TODO: convert section values to labels
          content: version.metadata.articleSection.join(', ')
        },
        {
          key: 'openReview',
          content: version.declarations.openReview ? 'Open review' : 'Closed review'
        }
      ]
    }}
    roles={project => {
      // TODO: only show the menu if editable
      return [
        {
          role: 'senior-editor',
          content: (
            <Menu
              label="Senior Editor"
              options={journal.editors.senior.map(editorOption)}
              placeholder="Assign an editor…"
              onChange={value => addUserToTeam({
                teamType: 'senior-editor',
                group: 'editor',
                project,
                user: value
              })}/>
          )
        }
      ]
    }}
  />
)

export default EditorSection
