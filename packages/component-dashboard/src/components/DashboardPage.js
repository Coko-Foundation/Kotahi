import { compose } from 'recompose'
import { connect } from 'react-redux'
import { orderBy } from 'lodash'
import actions from 'pubsweet-client/src/actions'
import { selectCurrentUser } from 'xpub-selectors'
import { ink } from 'pubsweet-component-ink-frontend/actions'
import { ConnectPage } from 'pubsweet-component-xpub-app/src/components'
import Dashboard from './Dashboard'

export default compose(
  ConnectPage(params => [
    actions.getCollections()
  ]),
  connect(
    state => ({
      projects: orderBy(state.collections, ['created'], ['desc']),
      currentUser: selectCurrentUser(state),
      isConverting: state.ink.isFetching
    }),
    {
      createProject: actions.createCollection,
      createVersion: actions.createFragment,
      deleteProject: actions.deleteCollection,
      convertToHTML: ink
    }
  )
)(Dashboard)
