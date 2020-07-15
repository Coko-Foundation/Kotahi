import React from 'react'
import { Page } from './molecules/Page'
import { TeamTableCell, TeamTable } from './molecules/Table'
import Team from './Team'
import TeamCreator from './TeamCreator'

const TeamsManager = ({
  teams = [],
  updateTeam,
  deleteTeam,
  createTeam,
  error,
  userOptions,
  manuscriptsOptions,
  typesOptions,
}) => (
  <Page>
    {error ? <div>{error}</div> : null}
    {teams.length > 0 && (
      <TeamTable>
        <TeamTableCell width={5}>#</TeamTableCell>
        <TeamTableCell>Type</TeamTableCell>
        <TeamTableCell>Object</TeamTableCell>
        <TeamTableCell width={40}>Members</TeamTableCell>
        <TeamTableCell width={15}>Actions</TeamTableCell>

        {teams.map((team, i) => (
          <Team
            deleteTeam={deleteTeam}
            key={team.id}
            number={i + 1}
            team={team}
            updateTeam={updateTeam}
            userOptions={userOptions}
          />
        ))}
      </TeamTable>
    )}
    <TeamCreator
      create={createTeam}
      manuscriptsOptions={manuscriptsOptions}
      typesOptions={typesOptions}
    />
  </Page>
)

export default TeamsManager
