import { compose } from 'recompose'
import { connect } from 'react-redux'
import actions from 'pubsweet-client/src/actions'
import { ConnectPage } from 'pubsweet-component-xpub-app/src/components'
import { selectCurrentUser, selectCollection, selectFragment } from 'xpub-selectors'
import Manuscript from './Manuscript'

export default compose(
  ConnectPage(({ params }) => [
    actions.getCollection({ id: params.project }),
    actions.getFragment({ id: params.project }, { id: params.version })
  ]),
  connect(
    (state, ownProps) => ({
      currentUser: selectCurrentUser(state),
      project: selectCollection(state, ownProps.params.project),
      version: selectFragment(state, ownProps.params.version)
    }),
    {
      fileUpload: actions.fileUpload,
      updateVersion: actions.updateFragment
    }
  )
)(Manuscript)
