import React, { useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'

import { Spinner } from '@pubsweet/ui/dist/atoms'
import { createTeamMutation } from '../../../component-review/src/components/DecisionPage'
import {
  GET_INVITATION_MANUSCRIPT_ID,
  //   UPDATE_INVITATION_STATUS,
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

  const [createTeam] = useMutation(createTeamMutation, {
    onCompleted: () => {
      localStorage.setItem('authorInvitationId', '')
      window.location.href = '/kotahi/dashboard'
    },
  })

  let manuscriptId, input

  useEffect(() => {
    if (data && invitedUser) {
      manuscriptId = data.invitationManuscriptId.manuscriptId
      const invitedUserId = invitedUser ? invitedUser.id : ''
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
