import { compose, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { actions } from 'pubsweet-client'
import Reviewer from './Reviewer'

const removeReviewer = props => () => {
  const { id } = props.reviewer

  return props.deleteFragment(props.project, { id })
}

export default compose(
  connect(null, {
    deleteFragment: actions.deleteFragment,
  }),
  withHandlers({
    removeReviewer: props => removeReviewer(props),
  }),
)(Reviewer)
