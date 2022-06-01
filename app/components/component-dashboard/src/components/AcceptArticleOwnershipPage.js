import React from 'react'
import { Redirect } from 'react-router-dom'
import { Container } from '../../../shared'

const AcceptArticleOwnershipPage = ({ match }) => {
  const invid = match.params.invitationId

  window.localStorage.setItem('authorInvitationId', invid)
  return (
    <Container>
      ACCEPTING ownership of article using invitation: {invid}
      <br />
      <br />I will autoredirect in a few moments...
      <Redirect to="/login" />
    </Container>
  )
}

export default AcceptArticleOwnershipPage
