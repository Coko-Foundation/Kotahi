import { compose } from 'recompose'
import { connect } from 'react-redux'
import { orderBy } from 'lodash'
import actions from 'pubsweet-client/src/actions'
import { selectCurrentUser } from 'xpub-selectors'
import { ConnectPage } from 'pubsweet-component-xpub-app/src/components'
import { uploadManuscript } from '../redux/manuscriptConversion'
import Dashboard from './Dashboard'

export default compose(
  ConnectPage(params => [
    actions.getCollections()
  ]),
  connect(
    state => ({
      projects: orderBy(state.collections, ['created'], ['desc']),
      currentUser: selectCurrentUser(state),
      conversion: state.manuscriptConversion
    }),
    {
      uploadManuscript,
      deleteProject: actions.deleteCollection,
    }
  )
)(Dashboard)
