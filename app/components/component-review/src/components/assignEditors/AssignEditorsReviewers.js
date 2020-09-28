import React from 'react'
import { Container, SectionHeader, SectionRowGrid, Title } from '../style'

const AssignEditorsReviewers = ({ manuscript, AssignEditor }) => (
  <Container flatTop>
    <SectionHeader>
      <Title>Assign Editors</Title>
    </SectionHeader>
    <SectionRowGrid>
      <AssignEditor manuscript={manuscript} teamRole="seniorEditor" />
      <AssignEditor manuscript={manuscript} teamRole="handlingEditor" />
    </SectionRowGrid>
  </Container>
)
export default AssignEditorsReviewers
