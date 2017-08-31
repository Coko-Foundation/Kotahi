import { compose } from 'recompose'
import { connect } from 'react-redux'
import { reduxForm } from 'redux-form'
import actions from 'pubsweet-client/src/actions'
import { withJournal, ConnectPage } from 'pubsweet-component-xpub-app/src/components'
import { selectCollection, selectFragment } from 'xpub-selectors'
import Submit from './Submit'

const onSubmit = (values, dispatch) => {
  // TODO: save fragment
  console.log('submit', values)
}

const onChange = (values, dispatch) => {
  // TODO: save fragment
  console.log('change', values)
}

export default compose(
  reduxForm({
    form: 'submit',
    onSubmit,
    onChange
  }),
  ConnectPage(params => [
    actions.getCollection({ id: params.project }),
    actions.getFragment({ id: params.project }, { id: params.version })
  ]),
  connect(
    (state, ownProps) => {
      const project = selectCollection(state, ownProps.params.project)
      const version = selectFragment(state, ownProps.params.version)

      const initialValues = {
        declarations: version.declarations,
        metadata: version.metadata,
        notes: version.notes,
        suggestions: version.suggestions,
        files: version.files
      }

      return { project, version, initialValues }
    }
  ),
  withJournal
)(Submit)
