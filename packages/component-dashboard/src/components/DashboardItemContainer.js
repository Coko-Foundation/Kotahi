import { compose } from 'recompose'
import { connect } from 'react-redux'
import actions from 'pubsweet-client/src/actions'
import { ConnectPage } from 'pubsweet-component-xpub-app/src/components'
import { selectFragment } from 'xpub-selectors'
import DashboardItem from './DashboardItem'

export default compose(
  ConnectPage(props => [
    actions.getFragment({id: props.project.fragments[0]})
  ]),
  connect(
    (state, ownProps) => ({
      version: selectFragment(state, ownProps.project.fragments[0])
    })
  )
)(DashboardItem)
