// eslint-disable-next-line import/prefer-default-export
import { v4 as uuid } from 'uuid'

export const stripHtml = htmlString => {
  const temp = document.createElement('span')
  temp.innerHTML = htmlString
  return temp.textContent
}

export const isCurrentUserCollaborative = (manuscript, currentUser) =>
  !!(
    manuscript?.teams?.find(team => team.role === 'collaborativeReviewer')
      ?.members || []
  ).find(member => member.user.id === currentUser?.id)

export const getCurrentUserReview = (manuscript, currentUser) => {
  const isUserCollaborative = isCurrentUserCollaborative(
    manuscript,
    currentUser,
  )

  return (
    manuscript?.reviews?.find(review =>
      review.isCollaborative && isUserCollaborative && !review.isDecision
        ? true
        : review.user?.id === currentUser.id && !review.isDecision,
    ) || {
      id: uuid(),
      isDecision: false,
      isHiddenReviewerName: true,
      jsonData: {},
      manuscriptId: manuscript?.id,
      userId: currentUser.id,
    }
  )
}
