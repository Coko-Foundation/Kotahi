import React, { useContext } from 'react'
import { Redirect } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { Container } from '../../../shared'
import { GET_INVITATION_STATUS } from '../../../../queries/invitation'
import InvitationLinkExpired from './InvitationLinkExpired'
import { ConfigContext } from '../../../config/src'

const AcceptArticleOwnershipPage = ({ match }) => {
  const config = useContext(ConfigContext)
  const { invitationId } = match.params

  const { loading, data, error } = useQuery(GET_INVITATION_STATUS, {
    variables: { id: invitationId },
  })

  if (loading) {
    return null
  }

  if (error) {
    return <InvitationLinkExpired />
  }

  if (data.invitationStatus.status === 'UNANSWERED') {
    window.localStorage.setItem('invitationId', invitationId)
    return (
      <Container>
        ACCEPTING ownership of article using invitation: {invitationId}
        <br />
        <br />I will autoredirect in a few moments...
        <Redirect to={`${config?.urlFrag}/login`} />
      </Container>
    )
  }

  return <InvitationLinkExpired />
}

export default AcceptArticleOwnershipPage
