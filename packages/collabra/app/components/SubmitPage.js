import { compose } from 'recompose'
import { connect } from 'redux'
import { actions } from 'pubsweet-client'
import { selectCollection } from 'xpub-selectors'

import Submit from 'pubsweet-component-xpub-submit'

export default compose(
  connect(
    (state, ownProps) => ({
      project: selectCollection(state, ownProps.params.project)
    }),
    {
      getVersions: actions.getFragments,
      getProject: actions.getCollection,
    }
  )
)(Submit)
