import React from 'react'
import { SectionHeader, SectionRowGrid, Title } from '../style'
import { SectionContent } from '../../../../shared'

const AssignEditorsReviewers = ({ manuscript, AssignEditor }) => (
  <SectionContent noGap>
    <SectionHeader>
      <Title>Assign Editors</Title>
    </SectionHeader>
    <SectionRowGrid>
      <AssignEditor manuscript={manuscript} teamRole="seniorEditor" />
      <AssignEditor manuscript={manuscript} teamRole="handlingEditor" />
    </SectionRowGrid>
  </SectionContent>
)
export default AssignEditorsReviewers
