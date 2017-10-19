import { pick, debounce } from 'lodash'
import { compose, withProps, withState, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { reduxForm, SubmissionError } from 'redux-form'
import { actions } from 'pubsweet-client'
import uploadFile from 'xpub-upload'
import { ConnectPage } from 'xpub-connect'
import { selectCollection, selectFragment } from 'xpub-selectors'
import Submit from './Submit'

const onSubmit = (values, dispatch, props) => {
  console.log('submit', values)

  return dispatch(actions.updateFragment(props.project, {
    id: props.version.id,
    rev: props.version.rev,
    submitted: new Date(),
    ...values
  })).then(() => {
    return dispatch(actions.updateCollection({
      id: props.project.id,
      rev: props.project.rev,
      status: 'submitted'
    }))
  }).then(() => {
    dispatch(push(`/`))
  }).catch(error => {
    if (error.validationErrors) {
      throw new SubmissionError()
    }
  })
}

// TODO: redux-form doesn't have an onBlur handler(?)
const onChange = (values, dispatch, props) => {
  console.log('change', values)

  return dispatch(actions.updateFragment(props.project, {
    id: props.version.id,
    rev: props.version.rev,
    // submitted: false,
    ...values
  }))

  // TODO: display a notification when saving/saving completes/saving fails
}

export default compose(
  ConnectPage(({ params }) => [
    actions.getCollection({ id: params.project }),
    actions.getFragment({ id: params.project }, { id: params.version })
  ]),
  connect(
    (state, { params }) => {
      const project = selectCollection(state, params.project)
      const version = selectFragment(state, params.version)

      return { project, version }
    },
    {
      uploadFile
    }
  ),
  withProps(({ version }) => {
    const paths = ['metadata', 'declarations', 'suggestions', 'notes', 'files']

    return {
      initialValues: pick(version, paths)
    }
  }),
  reduxForm({
    form: 'submit',
    // enableReinitialize: true,
    onSubmit,
    onChange: debounce(onChange, 1000, { maxWait: 5000 })
  }),
  withState('confirming', 'setConfirming', false),
  withHandlers({
    toggleConfirming: props => () => {
      props.setConfirming(confirming => !confirming)
    }
  })
)(Submit)
