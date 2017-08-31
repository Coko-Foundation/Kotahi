/* global CONFIG */

import { compose } from 'recompose'
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

      return { project, version, initialValues: version }
    },
    {
      uploadFile
    }
  ),
  withJournal
)(Submit)
