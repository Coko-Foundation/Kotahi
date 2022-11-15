import React, { useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/client'

import { Spinner } from '@pubsweet/ui/dist/atoms'
import {
  ASSIGN_USER_AS_AUTHOR,
  ASSIGN_USER_AS_REVIEWER,
  GET_INVITATION_MANUSCRIPT_ID,
  UPDATE_INVITATION_STATUS,
} from '../../../../queries/index'
import mutations from '../graphql/mutations'
import useCurrentUser from '../../../../hooks/useCurrentUser'

const InvitationAcceptedPage = () => {
  const invitationId = window.localStorage.getItem('invitationId')
    ? window.localStorage.getItem('invitationId')
    : ''

  const { data } = useQuery(GET_INVITATION_MANUSCRIPT_ID, {
    variables: { id: invitationId },
  })

  const invitedUser = useCurrentUser()

  const [updateInvitationStatus] = useMutation(UPDATE_INVITATION_STATUS, {
    onCompleted: () => {
      localStorage.removeItem('invitationId')
      window.location.href = '/kotahi/dashboard'
    },
  })

  const currentDate = new Date()

  const [assignUserAsAuthor] = useMutation(ASSIGN_USER_AS_AUTHOR, {
    onCompleted: () => {
      updateInvitationStatus({
        variables: {
          id: invitationId,
          status: 'ACCEPTED',
          userId: invitedUser ? invitedUser.id : null,
          responseDate: currentDate,
        },
      })
    },
  })

  const [assignUserAsReviewer] = useMutation(ASSIGN_USER_AS_REVIEWER, {
    onCompleted: teamFields => {
      addReviewerResponse({
        variables: {
          currentUserId: invitedUser ? invitedUser.id : null,
          action: 'accepted',
          teamId: teamFields?.addReviewer?.id,
        },
      })
    },
  })

  const [addReviewerResponse] = useMutation(
    mutations.reviewerResponseMutation,
    {
      onCompleted: () => {
        updateInvitationStatus({
          variables: {
            id: invitationId,
            status: 'ACCEPTED',
            userId: invitedUser ? invitedUser.id : null,
            responseDate: currentDate,
          },
        })
      },
    },
  )

  let manuscriptId

  useEffect(() => {
    if (data && invitedUser) {
      manuscriptId = data.invitationManuscriptId.manuscriptId
      const invitedUserId = invitedUser ? invitedUser.id : null

      if (data.invitationManuscriptId.invitedPersonType === 'AUTHOR') {
        // TODO For better security we should require the invitation ID to be sent in this mutation
        assignUserAsAuthor({
          variables: { manuscriptId, userId: invitedUserId },
        })
      }

      if (data.invitationManuscriptId.invitedPersonType === 'REVIEWER') {
        assignUserAsReviewer({
          variables: {
            manuscriptId,
            userId: invitedUserId,
            invitationId,
            isShared: !!data.invitationManuscriptId.isShared,
          },
        })
      }
    }
  }, [data, invitedUser])

  return <Spinner />
}

export default InvitationAcceptedPage
