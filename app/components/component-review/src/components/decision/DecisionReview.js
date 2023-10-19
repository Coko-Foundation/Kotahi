import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Button, Checkbox } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import { useTranslation } from 'react-i18next'
import { JournalContext } from '../../../../xpub-journal/src'
import { ConfigContext } from '../../../../config/src'
import ShareIcon from '../../../../../shared/icons/share'
import { UserCombo, Primary, Secondary, UserInfo } from '../../../../shared'
import { UserAvatar } from '../../../../component-avatar/src'
import { ensureJsonIsParsed } from '../../../../../shared/objectUtils'
import ReviewDetailsModal from '../../../../component-review-detail-modal/src'

export const ToggleReview = ({ open, toggle, t }) => {
  return (
    <Button onClick={toggle} plain>
      {open
        ? t('decisionPage.decisionTab.reviewModalHide')
        : t('decisionPage.decisionTab.reviewModalShow')}
    </Button>
  )
}

const Bullet = styled.span`
  background-color: black;
  background-color: ${props =>
    props.recommendation
      ? props.journal?.recommendations?.find(
          item => item.value === props.recommendation,
        )?.color
      : 'black'};
  border-radius: 100%;
  display: inline-block;
  height: 10px;
  margin-right: 10px;
  width: 10px;
`

export const ReviewHeadingRoot = styled.div`
  align-items: center;
  display: flex;
`

export const Ordinal = styled.span``

export const Name = styled.span`
  display: flex;
  margin-left: 1em;
`

export const Controls = styled.span`
  flex-grow: 1;
  text-align: right;
`

const StyledCheckbox = styled(Checkbox)`
  margin-left: 10px;
`

const ReviewHeading = ({
  id,
  journal,
  open,
  ordinal,
  recommendation,
  user,
  isHiddenFromAuthor,
  isHiddenReviewerName,
  toggleOpen,
  manuscriptId,
  teams,
  currentUser,
  canBePublishedPublicly,
  reviewUserId,
  review,
  isControlPage = false,
  updateReview,
  canHideReviews,
}) => {
  const config = useContext(ConfigContext)
  if (!currentUser) return null
  const { t } = useTranslation()

  const editorTeam = teams.filter(team => {
    return team.role.toLowerCase().includes('editor')
  })

  const currentUserIsEditor = editorTeam.length
    ? !!editorTeam
        .map(team => team.members)
        .flat()
        .filter(member => member.user.id === currentUser.id).length
    : false

  const toggleIsHiddenFromAuthor = (reviewId, reviewHiddenFromAuthor) => {
    updateReview(reviewId, {
      isHiddenFromAuthor: reviewHiddenFromAuthor,
      manuscriptId,
    })
  }

  const toggleIsHiddenReviewerNameFromPublishedAndAuthor = (
    reviewId,
    reviewerNameHiddenFromPublishedAndAuthor,
  ) => {
    updateReview(reviewId, {
      isHiddenReviewerName: reviewerNameHiddenFromPublishedAndAuthor,
      manuscriptId,
    })
  }

  // TODO: Display user's ORCID
  return (
    <ReviewHeadingRoot>
      <Bullet journal={journal} recommendation={recommendation} />
      <Ordinal>
        {t('decisionPage.decisionTab.reviewNum', { num: ordinal })}
      </Ordinal>
      &nbsp;
      <Name>
        {
          <UserCombo>
            <UserAvatar
              user={
                review.isHiddenReviewerName && !isControlPage
                  ? null
                  : review.user || user
              }
            />
            <UserInfo>
              {review.isHiddenReviewerName && !isControlPage ? (
                <Primary>
                  {t('decisionPage.decisionTab.Anonmyous Reviewer')}
                </Primary>
              ) : (
                <>
                  <Primary>{user.username}</Primary>
                  <Secondary>{user.defaultIdentity.identifier}</Secondary>
                </>
              )}
            </UserInfo>
          </UserCombo>
        }
        {(currentUserIsEditor ||
          currentUser.groupRoles.includes('groupManager')) &&
          canBePublishedPublicly &&
          config.instanceName === 'colab' && (
            <>
              &nbsp;
              <ShareIcon />
            </>
          )}
      </Name>
      {canHideReviews &&
        (currentUserIsEditor ||
          currentUser.groupRoles.includes('groupManager')) && (
          <>
            <StyledCheckbox
              checked={isHiddenFromAuthor || isHiddenFromAuthor == null}
              label={t('decisionPage.decisionTab.Hide review')}
              onChange={() => toggleIsHiddenFromAuthor(id, !isHiddenFromAuthor)}
            />
            <StyledCheckbox
              checked={isHiddenReviewerName || isHiddenReviewerName == null}
              label={t('decisionPage.decisionTab.Hide reviewer name')}
              onChange={() =>
                toggleIsHiddenReviewerNameFromPublishedAndAuthor(
                  id,
                  !isHiddenReviewerName,
                )
              }
            />
          </>
        )}
      <Controls>
        <ToggleReview open={open} t={t} toggle={toggleOpen} />
      </Controls>
    </ReviewHeadingRoot>
  )
}

const Root = styled.div`
  margin-bottom: calc(${th('gridUnit')} * 3);
`

const DecisionReview = ({
  review,
  reviewForm,
  reviewer,
  manuscriptId,
  teams,
  isControlPage,
  updateReview,
  canHideReviews,
  showEditorOnlyFields,
  threadedDiscussionProps,
  reviewerTeamMember,
  readOnly,
  updateSharedStatusForInvitedReviewer,
  updateTeamMember,
  currentUser,
}) => {
  const {
    isHiddenFromAuthor,
    isHiddenReviewerName,
    id,
    canBePublishedPublicly,
  } = review

  const recommendation = ensureJsonIsParsed(review.jsonData)?.verdict

  const { user, ordinal } = reviewer

  const journal = useContext(JournalContext)

  const [open, setOpen] = useState(false)
  const toggleOpen = () => setOpen(!open)

  return (
    <Root>
      <ReviewHeading
        canBePublishedPublicly={canBePublishedPublicly}
        canHideReviews={canHideReviews}
        currentUser={currentUser}
        id={id}
        isControlPage={isControlPage}
        isHiddenFromAuthor={isHiddenFromAuthor}
        isHiddenReviewerName={isHiddenReviewerName}
        journal={journal}
        manuscriptId={manuscriptId}
        open={open}
        ordinal={ordinal}
        recommendation={recommendation}
        review={review}
        reviewer={reviewer}
        reviewUserId={review.user?.id}
        teams={teams}
        toggleOpen={toggleOpen}
        updateReview={updateReview}
        user={user}
      />
      <ReviewDetailsModal
        isControlPage={isControlPage}
        isOpen={open}
        manuscriptId={manuscriptId}
        onClose={toggleOpen}
        readOnly={readOnly}
        review={review}
        reviewerTeamMember={reviewerTeamMember}
        reviewForm={reviewForm}
        showEditorOnlyFields={showEditorOnlyFields}
        showUserInfo
        threadedDiscussionProps={threadedDiscussionProps}
        updateReview={updateReview}
        updateSharedStatusForInvitedReviewer={
          updateSharedStatusForInvitedReviewer
        }
        updateTeamMember={updateTeamMember}
      />
    </Root>
  )
}

DecisionReview.propTypes = {
  // eslint-disable-next-line
  review: PropTypes.object,
  // eslint-disable-next-line
  reviewer: PropTypes.object,
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
}

ReviewHeading.propTypes = {
  // eslint-disable-next-line
  journal: PropTypes.object,
  open: PropTypes.bool.isRequired,
  ordinal: PropTypes.number.isRequired,
  recommendation: PropTypes.string,
  toggleOpen: PropTypes.func.isRequired,
  // eslint-disable-next-line
  user: PropTypes.object.isRequired,
}
ReviewHeading.defaultProps = { recommendation: null }

ToggleReview.propTypes = {
  open: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
}

Bullet.propTypes = {
  // eslint-disable-next-line
  journal: PropTypes.object,
  recommendation: PropTypes.string.isRequired,
}

export default DecisionReview
