import { grid, th } from '@pubsweet/ui-toolkit'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { Mail } from 'react-feather'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { convertTimestampToRelativeDateString } from '../../../../../shared/dateUtils'
import { UserAvatar } from '../../../../component-avatar/src'
import ReviewDetailsModal from '../../../../component-review-detail-modal/src'
import { color } from '../../../../../theme'

const Card = styled.div`
  background-color: ${color.gray97};
  border-bottom: 0.8px solid ${color.gray70};
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  font-size: ${th('fontSizeBaseSmall')};
  justify-content: space-between;
  padding: ${grid(1)};
  position: relative;
  width: 100%;

  &:hover {
    box-shadow: 0px 9px 5px -6px ${color.gray70};
    cursor: pointer;
    transition: 0.3s ease;
    z-index: 1;
  }
`

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: ${grid(1)};
`

const NameDisplay = styled.div`
  font-weight: bold;
`

const DateDisplay = styled.div`
  color: ${color.gray50};
  font-size: 12px;
  line-height: 1.2;
`

const LeftSide = styled.div`
  align-items: center;
  display: flex;
`

const EmailDisplay = styled(DateDisplay)`
  align-items: center;
  color: ${props =>
    props.invitationStatus === 'rejected'
      ? th('colorError')
      : color.brand1.base};
  display: flex;
  margin-top: calc(${th('gridUnit')} / 2);
`

const MailIcon = styled(Mail)`
  height: 12px;
  margin-right: calc(${th('gridUnit')} / 2);
  width: auto;
`

const KanbanCard = ({
  reviewer,
  isInvitation,
  manuscript,
  removeReviewer,
  status,
  reviewForm,
  review,
  isCurrentVersion,
  updateSharedStatusForInvitedReviewer,
  updateTeamMember,
  updateReview,
  showEmailInvitation,
}) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  return (
    <>
      <ReviewDetailsModal
        isInvitation={isInvitation}
        isOpen={open}
        manuscriptId={manuscript.id}
        onClose={() => setOpen(false)}
        readOnly={!isCurrentVersion}
        removeReviewer={removeReviewer}
        review={review}
        reviewerTeamMember={reviewer}
        reviewForm={reviewForm}
        status={status}
        updateReview={updateReview}
        updateSharedStatusForInvitedReviewer={
          updateSharedStatusForInvitedReviewer
        }
        updateTeamMember={updateTeamMember}
      />
      <Card onClick={() => setOpen(true)}>
        <LeftSide>
          <UserAvatar
            isClickable={!!reviewer.user}
            showHoverProfile={false}
            user={
              reviewer.user ?? {
                username: reviewer.invitedPersonName,
                isOnline: false,
              }
            }
          />
          <InfoGrid>
            <NameDisplay>
              {reviewer.user?.username ?? reviewer.invitedPersonName}
            </NameDisplay>
            <DateDisplay>
              {t('common.kanban.Last updated')}
              {` ${convertTimestampToRelativeDateString(reviewer.updated)}`}
            </DateDisplay>
            {showEmailInvitation && (
              <EmailDisplay>
                <MailIcon
                  invitationStatus={reviewer.status} // TODO why are we setting an arbitrary 'invitationStatus' attribute on this svg element?
                />{' '}
                {t('common.kanban.Invited via email')}
              </EmailDisplay>
            )}
          </InfoGrid>
        </LeftSide>
      </Card>
    </>
  )
}

KanbanCard.propTypes = {
  reviewer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      defaultIdentity: PropTypes.shape({
        identifier: PropTypes.string.isRequired,
      }),
    }),
  }).isRequired,
  isInvitation: PropTypes.bool.isRequired,
}

export default KanbanCard
