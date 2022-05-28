import React from 'react'
import { Container } from '../../../shared'

const AcceptArticleOwnershipPage = ({ match }) => {
  const invid = match.params.invitationId
  // eslint-disable-next-line no-console
  console.log(`about to accept your ${invid}`)

  return (
    <Container>
      ACCEPTING ownership of article using invitation: {invid}
      <br />
      <br />I will autoredirect in a few moments...
    </Container>
  )
}

export default AcceptArticleOwnershipPage
