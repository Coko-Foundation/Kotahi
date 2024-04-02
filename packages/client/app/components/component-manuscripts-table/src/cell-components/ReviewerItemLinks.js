import React from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Action, MediumRow } from '../../../shared'
import { color } from '../../../../theme'

const Divider = styled.div`
  background-image: linear-gradient(${color.brand2.base}, ${color.brand2.base});
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 1px 100%;
`

const ReviewerItemLinks = ({
  manuscript,
  urlFrag,
  reviewerRespond,
  currentUser,
  updateReviewerStatus,
  getMainActionLink,
}) => {
  const team =
    (manuscript.teams || []).find(team_ => team_.role === 'reviewer') || {}

  const currentMember =
    team.members &&
    team.members.find(member => member.user.id === currentUser.id)

  const status = currentMember?.status ?? 'none'

  const history = useHistory()

  const mainActionLink = getMainActionLink && getMainActionLink(manuscript)
  const { t } = useTranslation()

  const reviewLinkText = {
    completed: t('manuscriptsTable.reviewCompleted'),
    accepted: t('manuscriptsTable.reviewDo'),
    inProgress: t('manuscriptsTable.reviewContinue'),
    none: t('manuscriptsTable.viewOldReviews'),
  }

  if (['accepted', 'completed', 'inProgress', 'none'].includes(status)) {
    return (
      <Action
        onClick={async e => {
          e.stopPropagation()
          // on click, update review status before forwarding to link

          if (status === 'accepted') {
            await updateReviewerStatus({
              variables: {
                manuscriptId: manuscript.id,
                status: 'inProgress',
              },
            })
          }

          history.push(mainActionLink)
        }}
      >
        {reviewLinkText[status]}
      </Action>
    )
  }

  if (status === 'invited') {
    return (
      <MediumRow>
        <Action
          data-testid="accept-review"
          onClick={e => {
            e.stopPropagation()
            reviewerRespond({
              variables: {
                currentUserId: currentUser.id,
                action: 'accepted',
                teamId: team.id,
              },
            })
          }}
        >
          {t('manuscriptsTable.reviewAccept')}
        </Action>
        <Divider>&nbsp;</Divider>
        <Action
          data-testid="reject-review"
          onClick={e => {
            e.stopPropagation()
            reviewerRespond({
              variables: {
                currentUserId: currentUser.id,
                action: 'rejected',
                teamId: team.id,
              },
            })
          }}
        >
          {t('manuscriptsTable.reviewReject')}
        </Action>
      </MediumRow>
    )
  }

  return <Action disabled>{t(`reviewerStatus.${status}`)}</Action>
}

export default ReviewerItemLinks
