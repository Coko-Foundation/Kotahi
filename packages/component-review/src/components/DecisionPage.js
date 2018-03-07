import { debounce } from 'lodash'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { reduxForm, SubmissionError } from 'redux-form'
import { actions } from 'pubsweet-client'
import { ConnectPage } from 'xpub-connect'
import {
  selectCollection,
  selectCurrentVersion,
  selectFragment,
  selectFragments,
} from 'xpub-selectors'
import uploadFile from 'xpub-upload'
import DecisionLayout from './decision/DecisionLayout'

const onSubmit = (values, dispatch, { project, version, history }) => {
  version.decision = {
    ...version.decision,
    ...values,
    status: 'submitted',
    submitted: new Date(),
  }

  return dispatch(actions.makeDecision(project, version))
    .then(() => {
      // TODO: show "thanks for your review" message
      history.push('/')
    })
    .catch(error => {
      if (error.validationErrors) {
        throw new SubmissionError()
      }
    })
}

const onChange = (values, dispatch, { project, version }) => {
  version.decision = {
    ...version.decision,
    ...values,
  }

  return dispatch(
    actions.updateFragment(project, {
      decision: version.decision,
      id: version.id,
      rev: version.rev,
    }),
  )

  // TODO: display a notification when saving/saving completes/saving fails
}

export default compose(
  ConnectPage(({ match }) => [
    actions.getCollection({ id: match.params.project }),
    actions.getFragments({ id: match.params.project }),
  ]),
  connect(
    (state, { match }) => {
      const project = selectCollection(state, match.params.project)
      const versions = selectFragments(state, project.fragments)
      const version = selectFragment(state, match.params.version)
      const currentVersion = selectCurrentVersion(state, project)

      return { currentVersion, project, version, versions }
    },
    {
      uploadFile,
    },
  ),
  withRouter,
  withProps(({ decision }) => ({
    initialValues: decision,
  })),
  reduxForm({
    form: 'decision',
    onChange: debounce(onChange, 1000, { maxWait: 5000 }),
    onSubmit,
    destroyOnUnmount: false,
  }),
)(DecisionLayout)
