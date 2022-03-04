import React from 'react'
import { SectionHeader, SectionRowGrid, Title } from '../style'
import { SectionContent } from '../../../../shared'

const AssignEditorsReviewers = ({
  manuscript,
  AssignEditor,
  allUsers,
  updateTeam,
  createTeam,
  teamLabels,
}) => (
  <SectionContent>
    <SectionHeader>
      <Title>Assign Editors</Title>
    </SectionHeader>
    <SectionRowGrid>
      <AssignEditor
        allUsers={allUsers}
        createTeam={createTeam}
        manuscript={manuscript}
        teamLabels={teamLabels}
        teamRole="seniorEditor"
        updateTeam={updateTeam}
      />
      <AssignEditor
        allUsers={allUsers}
        createTeam={createTeam}
        manuscript={manuscript}
        teamLabels={teamLabels}
        teamRole="handlingEditor"
        updateTeam={updateTeam}
      />
      <AssignEditor
        allUsers={allUsers}
        createTeam={createTeam}
        manuscript={manuscript}
        teamLabels={teamLabels}
        teamRole="editor"
        updateTeam={updateTeam}
      />
    </SectionRowGrid>
  </SectionContent>
)

export default AssignEditorsReviewers
