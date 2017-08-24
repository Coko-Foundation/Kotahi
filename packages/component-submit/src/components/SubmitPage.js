import { compose } from 'recompose'
import { connect } from 'react-redux'
import actions from 'pubsweet-client/src/actions'
import { withJournal } from 'component-app'
import { selectCollection, selectFragment } from 'xpub-selectors'
import Submit from './Submit'

export default compose(
  connect(
    (state, ownProps) => ({
      project: selectCollection(state, ownProps.params.project),
      version: selectFragment(state, ownProps.params.version)
    }),
    {
      updateVersion: actions.updateFragment
    }
  ),
  withJournal
)(Submit)
