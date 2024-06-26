import React, { useEffect, useContext, useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import gql from 'graphql-tag'
import { useTranslation } from 'react-i18next'

import { Spinner } from '@pubsweet/ui/dist/atoms'
import {
  ASSIGN_USER_AS_AUTHOR,
  ASSIGN_USER_AS_REVIEWER,
} from '../../../../queries/team'
import {
  GET_INVITATION_MANUSCRIPT_ID,
  UPDATE_INVITATION_STATUS,
} from '../../../../queries/invitation'
import mutations from '../graphql/mutations'
import { ConfigContext } from '../../../config/src'
import { LinkAction, PaddedContent } from '../../../shared'

const GET_CURRENT_USER = gql`
  query currentUser {
    currentUser {
      id
    }
  }
`

const InvitationAcceptedPage = () => {
  const [hasError, setHasError] = useState(false)
  const config = useContext(ConfigContext)
  const { t } = useTranslation()
  const { urlFrag } = config

  const invitationId = window.localStorage.getItem('invitationId')
    ? window.localStorage.getItem('invitationId')
    : ''

  const { data } = useQuery(GET_INVITATION_MANUSCRIPT_ID, {
    variables: { id: invitationId },
  })

  const { data: invitedUserData } = useQuery(GET_CURRENT_USER)
  const invitedUserId = invitedUserData?.currentUser?.id

  const [updateInvitationStatus] = useMutation(UPDATE_INVITATION_STATUS, {
    onCompleted: () => {
      localStorage.removeItem('invitationId')
      window.location.href = `${urlFrag}/dashboard`
    },
  })

  const currentDate = new Date()

  const [assignUserAsAuthor] = useMutation(ASSIGN_USER_AS_AUTHOR, {
    onCompleted: () => {
      updateInvitationStatus({
        variables: {
          id: invitationId,
          status: 'ACCEPTED',
          userId: invitedUserId,
          responseDate: currentDate,
        },
      })
    },
    onError: () => {
      localStorage.removeItem('invitationId')
      setHasError(true)
    },
  })

  const [assignUserAsReviewer] = useMutation(ASSIGN_USER_AS_REVIEWER, {
    onCompleted: teamFields => {
      addReviewerResponse({
        variables: {
          currentUserId: invitedUserId,
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
            userId: invitedUserId,
            responseDate: currentDate,
          },
        })
      },
      onError: () => {
        localStorage.removeItem('invitationId')
        setHasError(true)
      },
    },
  )

  let manuscriptId

  useEffect(() => {
    if (data && invitedUserId) {
      manuscriptId = data.invitationManuscriptId.manuscriptId

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
            isCollaborative: false,
            isShared: !!data.invitationManuscriptId.isShared,
          },
        })
      }

      if (
        data.invitationManuscriptId.invitedPersonType ===
        'COLLABORATIVE_REVIEWER'
      ) {
        assignUserAsReviewer({
          variables: {
            manuscriptId,
            userId: invitedUserId,
            invitationId,
            isCollaborative: true,
            isShared: !!data.invitationManuscriptId.isShared,
          },
        })
      }
    }
  }, [data, invitedUserId])

  if (hasError) {
    return (
      <PaddedContent>
        <p>{t('invitationAcceptedPage.error')}</p>
        <LinkAction to={`${urlFrag}/dashboard`}>
          {t('invitationAcceptedPage.returnToDashboard')}
        </LinkAction>
      </PaddedContent>
    )
  }

  return <Spinner />
}

export default InvitationAcceptedPage
