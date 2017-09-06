import { compose } from 'recompose'
import { connect } from 'react-redux'
import actions from 'pubsweet-client/src/actions'
import { ConnectPage } from 'pubsweet-component-xpub-app/src/components'
import { selectFragment } from 'xpub-selectors'

export default Component => (
  compose(
    ConnectPage(({project}) => [
      actions.getFragment({id: project.id}, {id: project.fragments[0]})
    ]),
    connect(
      (state, {project}) => ({
        version: selectFragment(state, project.fragments[0])
      })
    )
  )(Component)
)
