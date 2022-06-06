import { useMutation, useQuery } from '@apollo/client'
import React, { useEffect } from 'react'
import { Container } from '../../../shared'
import {
  GET_INVITATION_STATUS,
  UPDATE_INVITATION_STATUS,
} from '../../../../queries/index'

const DeclineArticleOwnershipPage = ({ match }) => {
  const authorInvitationId = match.params.invitationId

  const { data } = useQuery(GET_INVITATION_STATUS, {
    variables: { id: authorInvitationId },
  })

  const [updateInvitationStatus] = useMutation(UPDATE_INVITATION_STATUS, {
    onCompleted: () => {
      localStorage.setItem('authorInvitationId', '')
    },
  })

  useEffect(() => {
    if (data && data.invitationStatus.status === 'UNANSWERED') {
      updateInvitationStatus({
        variables: { id: authorInvitationId, status: 'REJECTED' },
      })
    }
  }, [data])

  if (data && data.invitationStatus.status === 'UNANSWERED') {
    return (
      <Container>
        DECLINING ownership of article using invitation: {authorInvitationId}{' '}
        was successful
        <br />
        <br />
      </Container>
    )
  }

  return (
    <Container>
      The Invitation link is EXPIRED, please contact admin to send a new link
    </Container>
  )
}

export default DeclineArticleOwnershipPage
