import React from 'react'
import { connect } from 'react-redux'
import { compose, withProps } from 'recompose'
import { Menu } from 'xpub-ui'
import { withJournal } from 'xpub-journal'
import { addUserToTeam } from '../redux/teams'

const editorOption = user => ({
  value: user.id,
  label: user.username // TODO: name
})

// TODO: select multiple editors

const AssignEditor = ({ journal, project, team, teamName, teamTypeName, options, addUserToTeam }) => (
  <Menu
    value={team ? team.members[0] : null}
    label={teamName}
    options={options}
    placeholder="Assign an editor…"
    onChange={user => {
      addUserToTeam({
        team,
        teamTypeName,
        name: teamName,
        group: 'editor',
        project,
        user
      })
    }}/>
)

export default compose(
  withJournal,
  withProps(({ journal, teamTypeName }) => ({
    teamName: journal.roles[teamTypeName]
  })),
  connect(
    (state, { project, teamTypeName }) => ({
      team: state.teams && state.teams
        .find(team => team.object.type === 'collection'
          && team.object.id === project.id
          && team.teamType.name === teamTypeName),
      options: state.users && !state.users.isFetching && state.users.users
        // .filter(user => user.roles.includes(teamType)) // TODO
        .map(editorOption)
    }),
    {
      addUserToTeam
    }
  )
)(AssignEditor)
