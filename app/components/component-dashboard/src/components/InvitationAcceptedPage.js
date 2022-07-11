import React, { useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'

import { Spinner } from '@pubsweet/ui/dist/atoms'
import {
  ASSIGN_USER_AS_AUTHOR,
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

  const [assignUserAsAuthor] = useMutation(ASSIGN_USER_AS_AUTHOR, {
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

  let manuscriptId
  useEffect(() => {
    if (data && invitedUser) {
      manuscriptId = data.invitationManuscriptId.manuscriptId
      const invitedUserId = invitedUser ? invitedUser.id : null
      assignUserAsAuthor({
        variables: { manuscriptId, userId: invitedUserId },
      })
    }
  }, [data])

  return <Spinner />
}

export default InvitationAcceptedPage
