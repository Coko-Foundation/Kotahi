/* global CONFIG */

import { debounce } from 'lodash'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { reduxForm, SubmissionError } from 'redux-form'
import actions from 'pubsweet-client/src/actions'
import token from 'pubsweet-client/src/helpers/token'
import { ConnectPage } from 'pubsweet-component-xpub-app/src/components'
import { selectCollection, selectFragment } from 'xpub-selectors'
import ReviewLayout from './ReviewLayout'

const onSubmit = (values, dispatch, props) => {
  console.log('submit', values)

  return dispatch(actions.updateFragment(props.project, {
    id: props.review.id,
    submitted: true, // TODO: current date?
    ...values
  })).then(() => {
    // TODO: show "thanks for your review" message
    dispatch(push(`/`))
  }).catch(error => {
    if (error.validationErrors) {
      throw new SubmissionError()
    }
  })
}

const onChange = (values, dispatch, props) => {
  console.log('change', values)

  return dispatch(actions.updateFragment(props.project, {
    id: props.review.id,
    // submitted: false,
    ...values
  }))

  // TODO: display a notification when saving/saving completes/saving fails
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
  ConnectPage(({ params }) => [
    actions.getCollection({ id: params.project }),
    actions.getFragment({ id: params.project }, { id: params.version }),
    actions.getFragment({ id: params.project }, { id: params.review }),
  ]),
  connect(
    (state, ownProps) => ({
      project: selectCollection(state, ownProps.params.project),
      version: selectFragment(state, ownProps.params.version),
      review: selectFragment(state, ownProps.params.review)
    }),
    {
      uploadFile
    }
  ),
  withProps(({ review }) => {
    return {
      initialValues: review
    }
  }),
  reduxForm({
    form: 'review',
    onSubmit,
    onChange: debounce(onChange, 1000)
  })
)(ReviewLayout)
