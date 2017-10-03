import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import actions from 'pubsweet-client/src/actions'
import { newestFirst, selectCurrentUser } from 'xpub-selectors'
import { ConnectPage } from 'xpub-connect'
import { uploadManuscript } from '../redux/conversion'
import Dashboard from './Dashboard'
import AssignEditorContainer from './AssignEditorContainer'

const reviewerResponse = dispatch => (project, version, reviewer, status) => {
  reviewer.status = status

  return dispatch(actions.updateFragment(project, {
    id: version.id,
    reviewers: version.reviewers
  }))
}

export default compose(
  ConnectPage(() => [
    actions.getCollections(),
    actions.getTeams(),
    actions.getUsers(),
  ]),
  connect(
    state => {
      const collections = state.collections
      const teams = state.teams
      const currentUser = selectCurrentUser(state)
      const conversion = state.conversion

      const sortedCollections = newestFirst(collections)

      const dashboard = {
        owner: sortedCollections
          .filter(collection => collection.owners
            && collection.owners.includes(currentUser.id)),
        assign: sortedCollections
          .filter(collection => collection.status === 'submitted'),
        editor: newestFirst(teams
          .filter(team => team.group === 'editor'
            && team.object.type === 'collection'
            && team.members.includes(currentUser.id))
          .map(team => collections.find(
            collection => collection.id === team.object.id
          ))),
        // reviewer: newestFirst(teams
        //   .filter(team => team.group === 'reviewer'
        //     && team.object.type === 'collection'
        //     && team.members.includes(currentUser.id))
        //   .map(team => collections.find(collection => {
        //     return collection.id === team.object
        //   }))),
        reviewer: sortedCollections
          .filter(collection => collection.reviewers.some(
            reviewer => reviewer && reviewer.user === currentUser.id
          )),
      }

      return { collections, currentUser, conversion, dashboard }
    },
    {
      uploadManuscript,
      reviewerResponse,
      deleteProject: actions.deleteCollection,
    }
  ),
  withProps({
    AssignEditor: AssignEditorContainer
  })
)(Dashboard)
