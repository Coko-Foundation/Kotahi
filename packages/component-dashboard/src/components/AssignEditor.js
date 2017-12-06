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
    label={teamName}
    onChange={user => {
      addUserToTeam({
        group: 'editor',
        name: teamName,
        project,
        team,
        teamTypeName,
        user,
      })
    }}
    options={options}
    placeholder="Assign an editor…"
    value={team ? team.members[0] : null}
  />
)

export default compose(
  withJournal,
  withProps(({ journal, teamTypeName }) => ({
    teamName: journal.roles[teamTypeName],
  })),
)(AssignEditor)
