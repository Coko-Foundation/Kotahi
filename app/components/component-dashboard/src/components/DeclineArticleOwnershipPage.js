import { useMutation } from '@apollo/client'
import React from 'react'
import { Container } from '../../../shared'

// const models = require('@pubsweet/models')

const DeclineArticleOwnershipPage = ({ match }) => {
  const invid = match.params.invitationId
  const [successful, setSuccessful] = useState(null) // default state will be false
  useMutation(() => {
    // make API request to decline the invitation with this particular invitation ID
    /// make mutation ingraphql and pass invitation ID.
  })
  // const useState = models.Invitation.decline(invid)

  // mutation response will set the successful variable true, else false
  // const successful = declinedInvitation ? 'successful' : 'unsuccesfful'

  // until mutation is completed, show loader. (useState loading can be added)
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
