import React, { useContext } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { JournalContext } from 'xpub-journal'
import { Roles } from '../molecules/Roles'

const Root = styled.div``
const Title = styled.div``

const AssignEditorsReviewers = ({ manuscript, AssignEditor }) => {
  // TODO:
  const journal = useContext(JournalContext)
  // const journal = { id: 'temp' }
  return (
    <Root>
      <Title>Assign Editors</Title>
      <Roles>
        <AssignEditor manuscript={manuscript} teamRole="seniorEditor" />
        <AssignEditor manuscript={manuscript} teamRole="handlingEditor" />
      </Roles>
      <Link to={`/journals/${journal.id}/versions/${manuscript.id}/reviewers`}>
        Assign Reviewers
      </Link>
    </Root>
  )
}
export default AssignEditorsReviewers
