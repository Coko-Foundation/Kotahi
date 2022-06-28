import React, { useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'

import { Spinner } from '@pubsweet/ui/dist/atoms'
import {
  CREATE_TEAM_MUTATION,
  GET_INVITATION_MANUSCRIPT_ID,
  UPDATE_INVITATION_STATUS,
} from '../../../../queries/index'
import useCurrentUser from '../../../../hooks/useCurrentUser'

const InvitationAcceptedPage = () => {
  const authorInvitationId = window.localStorage.getItem('authorInvitationId')
    ? window.localStorage.getItem('authorInvitationId')
    : ''

  const { data } = useQuery(GET_INVITATION_MANUSCRIPT_ID, {
    variables: { id: authorInvitationId },
  })

  const invitedUser = useCurrentUser()

  const [updateInvitationStatus] = useMutation(UPDATE_INVITATION_STATUS, {
    onCompleted: () => {
      localStorage.removeItem('authorInvitationId')
      window.location.href = '/kotahi/dashboard'
    },
  })

  const currentDate = new Date()

  const [createTeam] = useMutation(CREATE_TEAM_MUTATION, {
    onCompleted: () => {
      updateInvitationStatus({
        variables: {
          id: authorInvitationId,
          status: 'ACCEPTED',
          userId: invitedUser ? invitedUser.id : null,
          responseDate: currentDate,
        },
      })
    },
  })

  let manuscriptId, input
  useEffect(() => {
    if (data && invitedUser) {
      manuscriptId = data.invitationManuscriptId.manuscriptId
      const invitedUserId = invitedUser ? invitedUser.id : null
      input = {
        role: 'author',
        name: 'Author',
        manuscriptId,
        members: [{ user: { id: invitedUserId } }],
      }
      createTeam({ variables: { input } })
    }
  }, [data])

  return <Spinner />
}

export default InvitationAcceptedPage
