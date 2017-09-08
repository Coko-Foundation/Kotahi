import { debounce } from 'lodash'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { reduxForm, SubmissionError } from 'redux-form'
import actions from 'pubsweet-client/src/actions'
import { ConnectPage } from 'xpub-connect'
import uploadFile from 'xpub-upload'
import { selectCollection, selectFragment } from 'xpub-selectors'
import DecisionLayout from './DecisionLayout'

const onSubmit = (values, dispatch, props) => {
  console.log('submit', values)

  return dispatch(actions.updateFragment(props.project, {
    id: props.decision.id,
    submitted: new Date(),
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
    id: props.decision.id,
    // submitted: false,
    ...values
  }))

  // TODO: display a notification when saving/saving completes/saving fails
}

export default compose(
  ConnectPage(({params}) => [
    actions.getCollection({id: params.project}),
    actions.getFragment({id: params.project}, {id: params.version}),
    actions.getFragment({id: params.project}, {id: params.decision}),
  ]),
  connect(
    (state, { params }) => ({
      project: selectCollection(state, params.project),
      version: selectFragment(state, params.version),
      decision: selectFragment(state, params.decision)
    }),
    {
      uploadFile
    }
  ),
  withProps(({decision}) => {
    return {
      initialValues: decision
    }
  }),
  reduxForm({
    form: 'decision',
    onSubmit,
    onChange: debounce(onChange, 1000)
  })
)(DecisionLayout)
