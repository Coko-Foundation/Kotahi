import React from 'react'
import { Menu } from 'xpub-ui'
import { withJournal } from 'pubsweet-component-xpub-app/src/components'

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

export default withJournal(AssignEditor)
