/* global CONFIG */

import { pick } from 'lodash'
import { compose, withState, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { reduxForm } from 'redux-form'
import actions from 'pubsweet-client/src/actions'
import token from 'pubsweet-client/src/helpers/token'
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

const uploadFile = file => dispatch => {
  // TODO: import the endpoint URL from a client module
  const API_ENDPOINT = CONFIG['pubsweet-server'].API_ENDPOINT

  const data = new FormData()
  data.append('file', file)

  const request = new XMLHttpRequest()
  request.open('POST', API_ENDPOINT + '/upload')
  request.setRequestHeader('Authorization', 'Bearer ' + token())
  request.setRequestHeader('Accept', 'text/plain') // the response is a URL
  request.send(data)

  return request
}

export default compose(
  ConnectPage(params => [
    actions.getCollection({ id: params.project }),
    actions.getFragment({ id: params.project }, { id: params.version })
  ]),
  withJournal,
  connect(
    (state, ownProps) => {
      const version = selectFragment(state, ownProps.params.version)
      const paths = ['metadata', 'declarations', 'suggestions', 'notes', 'files']

      return {
        initialValues: pick(version, paths)
      }
    }
  ),
  connect(
    (state, ownProps) => ({
        project: selectCollection(state, ownProps.params.project),
        version: selectFragment(state, ownProps.params.version)
    }),
    {
      uploadFile
    }
  ),
  reduxForm({
    form: 'submit',
    // enableReinitialize: true,
    onSubmit,
    onChange
  }),
  withState('confirming', 'setConfirming', false),
  withHandlers({
    toggleConfirming: props => () => {
      props.setConfirming(confirming => !confirming)
    }
  })
)(Submit)
