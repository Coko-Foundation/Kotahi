export const selectCurrentUser = (state) => state.currentUser.isAuthenticated
  ? state.currentUser.user
  : null

export const selectCollection = (state, id) => state.collections
  .find(collection => collection.id === id)

export const selectFragments = (state, ids) => ids
  .map(id => state.fragments[id])
  .filter(fragment => fragment) // TODO: there shouldn't be any missing
