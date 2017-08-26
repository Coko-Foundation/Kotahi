import { compose } from 'recompose'
import { connect } from 'react-redux'
import actions from 'pubsweet-client/src/actions'
import { withJournal } from 'pubsweet-component-xpub-app/src/components'
import { selectCollection, selectFragment } from 'xpub-selectors'
import Submit from './Submit'

export default compose(
  connect(
    (state, ownProps) => {
      const project = selectCollection(state, ownProps.params.project)
      const version = selectFragment(state, ownProps.params.version)

      const initialValues = {
        declarations: version.declarations,
        metadata: version.metadata
      }

      return { project, version, initialValues }
    },
    {
      updateVersion: actions.updateFragment
    }
  ),
  withJournal
)(Submit)
