import React from 'react'
import { Container } from '../../../shared'


// eslint-disable-next-line no-console
console.log(`about declining`);

const DeclineArticleOwnershipPage = ({ match }) => {
  const invid = match.params.invitationId
  // eslint-disable-next-line no-console
  console.log(`about to decline your ${invid}`)

  return (
    <Container>DECLINING ownership of article using invitation: ${invid}
      <br />
      <br />
      Would you like to give a reason?
    </Container>
  )
}

export default DeclineArticleOwnershipPage
