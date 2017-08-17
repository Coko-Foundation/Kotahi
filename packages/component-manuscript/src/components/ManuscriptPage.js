import { compose } from 'recompose'
import { connect } from 'react-redux'
import { actions } from 'pubsweet-client'
import { selectCurrentUser, selectCollection, selectFragment } from 'xpub-selectors'
import Manuscript from './Manuscript'

export default compose(
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
