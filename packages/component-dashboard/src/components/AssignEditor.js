import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'recompose'
import { Menu } from 'xpub-ui'
import { withJournal } from 'xpub-journal'
import { addUserToTeam } from '../redux/teams'

const editorOption = editor => ({
  value: editor.user,
  label: editor.name
})

// TODO: select multiple editors

const AssignEditor = ({ journal, project, team, teamType, addUserToTeam }) => (
  <Menu
    value={team ? team.members[0] : null}
    label={journal.roles[teamType]}
    options={journal.editors[teamType].map(editorOption)}
    placeholder="Assign an editor…"
    onChange={user => {
      addUserToTeam({
        team,
        teamType,
        name: journal.roles[teamType],
        group: 'editor',
        project,
        user
      })
    }}/>
)

export default compose(
  withJournal,
  connect(
    (state, { project, teamType }) => ({
      team: state.teams && state.teams
        .find(team => team.object.type === 'collection'
          && team.object.id === project.id
          && team.teamType === teamType)
    }),
    {
      addUserToTeam
    }
  )
)(AssignEditor)
