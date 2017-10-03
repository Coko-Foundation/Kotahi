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
