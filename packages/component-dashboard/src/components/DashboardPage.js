import { compose } from 'recompose'
import { connect } from 'react-redux'
import { orderBy } from 'lodash'
import { actions } from 'pubsweet-client'
import { selectCurrentUser } from 'xpub-selectors'
import { ink } from 'pubsweet-component-ink-frontend/actions'
import Dashboard from './Dashboard'

export default compose(
  connect(
    state => ({
      projects: orderBy(state.collections, 'created', 'desc'),
      currentUser: selectCurrentUser(state),
      isConverting: state.ink.isFetching
    }),
    {
      createProject: actions.createCollection,
      createVersion: actions.createFragment,
      convertToHTML: ink
    }
  )
)(Dashboard)
