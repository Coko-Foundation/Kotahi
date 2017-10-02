import { find, pick } from 'lodash'
import { compose, withProps, withState, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { reduxForm, SubmissionError } from 'redux-form'
import { actions } from 'pubsweet-client'
import uploadFile from 'xpub-upload'
import { ConnectPage } from 'xpub-connect'
import { selectCollection, selectFragment, selectVersion } from 'xpub-selectors'
import Submit from './Submit'

const onSubmit = (values, dispatch, { journal, project, version }) => {
  console.log('submit', values)

  Object.assign(version, values, {
    submitted: new Date()
  })

  return dispatch(actions.updateFragment(journal, {
    id: project.id,
    versions: project.versions
  })).then(() => {
    dispatch(push('/'))
  }).catch(error => {
    if (error.validationErrors) {
      throw new SubmissionError()
    }
  })
}

// TODO: redux-form doesn't have an onBlur handler(?)
const onBlur = (values, dispatch, { journal, project, version }) => {
  console.log('blur', values)

  Object.assign(version, values, {
    submitted: new Date()
  })

  return dispatch(actions.updateFragment(journal, {
    id: project.id,
    versions: project.versions
  }))

  // TODO: display a notification when saving/saving completes/saving fails
}

export default compose(
  ConnectPage(({ params }) => [
    actions.getCollection({ id: params.journal }),
    actions.getFragment({ id: params.project })
  ]),
  connect(
    (state, { params }) => {
      const journal = selectCollection(state, params.journal)
      const project = selectFragment(state, params.project)
      const version = selectVersion(project, params.version)

      return { journal, project, version }
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
    onBlur
  }),
  withState('confirming', 'setConfirming', false),
  withHandlers({
    toggleConfirming: props => () => {
      props.setConfirming(confirming => !confirming)
    }
  })
)(Submit)
