import { debounce } from 'lodash'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { reduxForm, SubmissionError } from 'redux-form'
import { actions } from 'pubsweet-client'
import { ConnectPage } from 'xpub-connect'
import {
  selectCurrentUser,
  selectCollection,
  selectFragments,
  selectCurrentVersion,
  selectFragment,
  selectUser,
  getReviewerFromUser,
} from 'xpub-selectors'
import uploadFile from 'xpub-upload'
import ReviewLayout from './review/ReviewLayout'

const onSubmit = (
  values,
  dispatch,
  { history, project, version, reviewer },
) => {
  Object.assign(reviewer, {
    status: 'reviewed',
    submitted: new Date(),
    ...values,
  })

  return dispatch(
    actions.updateFragment(project, {
      id: version.id,
      rev: version.rev,
      reviewers: version.reviewers,
    }),
  )
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

const onChange = (values, dispatch, { project, version, reviewer }) => {
  Object.assign(reviewer, {
    // submitted: new Date(),
    ...values,
  })

  return dispatch(
    actions.updateFragment(project, {
      id: version.id,
      rev: version.rev,
      reviewers: version.reviewers,
    }),
  )

  // TODO: display a notification when saving/saving completes/saving fails
}

export default compose(
  ConnectPage(({ match }) => [
    actions.getCollection({ id: match.params.project }),
    actions.getFragments({ id: match.params.project }),
    actions.getTeams(),
    actions.getUsers(),
  ]),
  connect(
    (state, { match }) => {
      const currentUser = selectCurrentUser(state)
      const project = selectCollection(state, match.params.project)
      const versions = selectFragments(state, project.fragments)
      const version = selectFragment(state, match.params.version)
      const currentVersion = selectCurrentVersion(state, project)

      let handlingEditors
      const editors = state.teams.find(
        team =>
          team.object.type === 'collection' &&
          team.object.id === match.params.project &&
          team.teamType.name === 'handlingEditor',
      )

      if (editors) {
        handlingEditors = editors.members.map(id => selectUser(state, id))
      }
      const reviewer = getReviewerFromUser(project, currentVersion, currentUser)

      return {
        currentVersion,
        handlingEditors,
        project,
        reviewer,
        version,
        versions,
      }
    },
    {
      uploadFile,
    },
  ),
  withRouter,
  withProps(({ reviewer }) => ({
    initialValues: reviewer,
  })),
  reduxForm({
    form: 'review',
    onChange: debounce(onChange, 1000, { maxWait: 5000 }),
    onSubmit,
  }),
)(ReviewLayout)
