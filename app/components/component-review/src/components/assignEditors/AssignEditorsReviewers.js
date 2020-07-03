import React from 'react'
import styled from 'styled-components'
import { Action } from '@pubsweet/ui'
import {
  Roles,
  Container,
  SectionHeader,
  SectionRowGrid,
  Title,
} from '../style'

const AssignEditorsReviewers = ({ manuscript, AssignEditor }) => (
  <Container>
    <SectionHeader>
      <Title>Assign Editors</Title>
    </SectionHeader>
    <SectionRowGrid>
      <AssignEditor manuscript={manuscript} teamRole="seniorEditor" />
      <AssignEditor manuscript={manuscript} teamRole="handlingEditor" />

      <Action to={`/journal/versions/${manuscript.id}/reviewers`}>
        Assign Reviewers
      </Action>
    </SectionRowGrid>
  </Container>
)
export default AssignEditorsReviewers
