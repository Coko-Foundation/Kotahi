import { compose } from 'recompose'
import { connect } from 'react-redux'
import { actions } from 'pubsweet-client'
import { ConnectPage } from 'xpub-connect'
import { selectCurrentVersion } from 'xpub-selectors'

export default Component =>
  compose(
    ConnectPage(({ project }) => [actions.getFragments({ id: project.id })]),
    connect((state, { project }) => ({
      version: selectCurrentVersion(state, project),
    })),
  )(Component)
