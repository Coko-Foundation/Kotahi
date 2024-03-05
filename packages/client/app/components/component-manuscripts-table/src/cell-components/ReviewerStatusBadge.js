import React from 'react'
import i18next from 'i18next'
import { ConfigurableStatus } from '../../../shared'
import reviewStatuses from '../../../../../config/journal/review-status'
import { getMembersOfTeam } from '../../../../shared/manuscriptUtils'
import localizeReviewFilterOptions from '../../../../shared/localizeReviewFilterOptions'

const ReviewerStatusBadge = ({ manuscript, currentUser }) => {
  const members = getMembersOfTeam(manuscript, 'reviewer')

  const status = members?.find(
    member => member.user.id === currentUser.id,
  )?.status

  const LocalizedReviewFilterOptions = localizeReviewFilterOptions(
    reviewStatuses,
    i18next.t,
  )

  const statusConfig = LocalizedReviewFilterOptions.find(
    item => item.value === status,
  )

  return (
    <ConfigurableStatus
      color={statusConfig.color}
      lightText={statusConfig.lightText}
    >
      {statusConfig.label}
    </ConfigurableStatus>
  )
}

export default ReviewerStatusBadge
