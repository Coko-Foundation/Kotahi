import React from 'react'
import styled from 'styled-components'
import { Button, Menu } from '@pubsweet/ui'
import { TeamTableCell } from './molecules/Table'

const StyledMenu = styled(Menu)`
  width: 100%;
`

const Team = ({ team, number, userOptions, deleteTeam, updateTeam }) => (
  <>
    <TeamTableCell width={5}>{number}</TeamTableCell>
    <TeamTableCell>
      {team.name} {team.role}
    </TeamTableCell>
    <TeamTableCell>
      {team.object && team.object.objectType} {team.object && team.object.objectId}
    </TeamTableCell>
    <TeamTableCell width={40}>
      <StyledMenu
        inline
        multi
        name="members"
        onChange={members => updateTeam(members, team)}
        options={userOptions}
        value={team.members.map(member => member.user && member.user.id)}
      />
    </TeamTableCell>
    <TeamTableCell width={15}>
      <Button onClick={() => deleteTeam(team)}>Delete</Button>
    </TeamTableCell>
  </>
)

export default Team
