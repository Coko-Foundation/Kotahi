import React from 'react'
import { SectionHeader, SectionRowGrid, Title } from '../style'
import { SectionContent } from '../../../../shared'

const AssignEditorsReviewers = ({ manuscript, AssignEditor }) => (
  <SectionContent>
    <SectionHeader>
      <Title>Assign Editors</Title>
    </SectionHeader>
    <SectionRowGrid>
      <AssignEditor manuscript={manuscript} teamRole="seniorEditor" />
      <AssignEditor manuscript={manuscript} teamRole="handlingEditor" />
      <AssignEditor manuscript={manuscript} teamRole="editor" />
    </SectionRowGrid>
  </SectionContent>
)

export default AssignEditorsReviewers
