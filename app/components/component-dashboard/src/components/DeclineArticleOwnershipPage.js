import React from 'react'
import { Container } from '../../../shared'
const models = require('@pubsweet/models')

const DeclineArticleOwnershipPage = ({ match }) => {
  const invid = match.params.invitationId
  // eslint-disable-next-line no-console
  console.log(`about to decline your ${invid}`)

  const declinedInvitation = models.Invitation.decline(invid)

  const successful = declinedInvitation ? 'successful' : 'unsuccesfful'
  return (
    <Container>
      DECLINING ownership of article using invitation: ${invid} was
      {successful}
      <br />
      <br />
      Would you like to give a reason?
    </Container>
  )
}

export default DeclineArticleOwnershipPage
