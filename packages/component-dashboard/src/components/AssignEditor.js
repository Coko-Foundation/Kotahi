import React from 'react'
import { compose, withProps } from 'recompose'
import { Menu } from 'xpub-ui'
import { withJournal } from 'xpub-journal'

// TODO: select multiple editors
const AssignEditor = ({
  journal,
  project,
  team,
  teamName,
  teamTypeName,
  options,
  addUserToTeam,
}) => (
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
        user,
      })
    }}
  />
)

export default compose(
  withJournal,
  withProps(({ journal, teamTypeName }) => ({
    teamName: journal.roles[teamTypeName],
  })),
)(AssignEditor)
