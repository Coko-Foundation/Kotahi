import React from 'react'
import { t } from 'i18next'
import { CompactDetailLabel, ConfigurableStatus } from '../../../shared'
import reviewStatuses from '../../../../../config/journal/review-status'
import { getMembersOfTeam } from '../../../../shared/manuscriptUtils'
import localizeReviewFilterOptions from '../../../../shared/localizeReviewFilterOptions'

const ReviewerStatusBadge = ({ manuscript, currentUser }) => {
  const members = getMembersOfTeam(manuscript, 'reviewer')

  const memberRecord = members?.find(
    member => member.user.id === currentUser.id,
  )

  if (!memberRecord)
    return (
      <CompactDetailLabel>
        {t('reviewerStatus.notAssignedForThisVersion')}
      </CompactDetailLabel>
    )

  const status = memberRecord?.status

  const LocalizedReviewFilterOptions = localizeReviewFilterOptions(
    reviewStatuses,
    t,
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
