import { orderBy } from 'lodash'

export const newestFirst = items => orderBy(items, ['created'], ['desc'])

export const selectCurrentUser = state => state.currentUser.isAuthenticated
  ? state.currentUser.user
  : null

// TODO: collections should be keyed by id
export const selectCollection = (state, id) => state.collections
  .find(collection => collection.id === id)

// TODO: there shouldn't be any missing
export const selectFragments = (state, ids) => ids
  .map(id => state.fragments[id])
  .filter(fragment => fragment)

export const selectFragment = (state, id) => state.fragments[id]

export const selectCurrentVersion = (state, project) => {
  return newestFirst(selectFragments(state, project.fragments))[0]
}

export const getReviewerFromUser = (project, version, currentUser) => {
  if (!project.reviewers || !version.reviewers) return null

  const projectReviewer = project.reviewers.find(
    reviewer => reviewer && reviewer.user === currentUser.id
  )

  return version.reviewers.find(
    reviewer => reviewer && reviewer.reviewer === projectReviewer.id
  )
}

export const selectUser = (state, id) => state.users.users
  .find(user => user.id === id)
