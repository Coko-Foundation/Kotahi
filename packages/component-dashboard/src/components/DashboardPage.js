import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import { orderBy } from 'lodash'
import actions from 'pubsweet-client/src/actions'
import { selectCurrentUser } from 'xpub-selectors'
import { ConnectPage } from 'xpub-connect'
import { uploadManuscript } from '../redux/conversion'
import { addUserToTeam } from '../redux/teams'
import Dashboard from './Dashboard'

const newestFirst = items => orderBy(items, ['created'], ['desc'])

export default compose(
  ConnectPage(() => [
    actions.getCollections(),
    actions.getTeams(),
  ]),
  connect(
    state => ({
      collections: state.collections,
      teams: state.teams,
      currentUser: selectCurrentUser(state),
      conversion: state.conversion
    }),
    {
      uploadManuscript,
      addUserToTeam,
      deleteProject: actions.deleteCollection,
    }
  ),
  withProps(({ collections, currentUser, teams }) => {
    return {
      dashboard: {
        owner: collections
          .filter(collection => collection.owners
            && collection.owners.includes(currentUser.id))
          .sort(newestFirst),
        assign: collections
          .filter(collection => collection.status === 'submitted')
          .sort(newestFirst),
        editor: teams
          .filter(team => team.group === 'editor'
            && team.object.type === 'collection'
            && team.members.includes(currentUser.id))
          .map(team => collections.find(collection => {
            return collection.id === team.object
          }))
          .sort(newestFirst),
        reviewer: teams
          .filter(team => team.group === 'reviewer'
            && team.object.type === 'collection'
            && team.members.includes(currentUser.id))
          .map(team => collections.find(collection => {
            return collection.id === team.object
          }))
          .sort(newestFirst),
      }
    }
  })
)(Dashboard)
