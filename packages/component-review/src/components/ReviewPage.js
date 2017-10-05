import { debounce } from 'lodash'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { reduxForm, SubmissionError } from 'redux-form'
import { actions } from 'pubsweet-client'
import { ConnectPage } from 'xpub-connect'
import { selectCurrentUser, selectCollection, selectFragments, selectCurrentVersion, selectFragment, selectUser, getReviewerFromUser } from 'xpub-selectors'
import uploadFile from 'xpub-upload'
import ReviewLayout from './review/ReviewLayout'

const onSubmit = (values, dispatch, { project, version, reviewer }) => {
  console.log('submit', values)

  Object.assign(reviewer, {
    submitted: new Date(),
    status: 'reviewed',
    ...values
  })

  return dispatch(actions.updateFragment(project, {
    id: version.id,
    reviewers: version.reviewers
  })).then(() => {
    // TODO: show "thanks for your review" message
    dispatch(push(`/`))
  }).catch(error => {
    if (error.validationErrors) {
      throw new SubmissionError()
    }
  })
}

const onChange = (values, dispatch, { project, version, reviewer }) => {
  console.log('change', values)

  Object.assign(reviewer, {
    submitted: new Date(),
    ...values
  })

  return dispatch(actions.updateFragment(project, {
    id: version.id,
    reviewers: version.reviewers
  }))

  // TODO: display a notification when saving/saving completes/saving fails
}

export default compose(
  ConnectPage(({ params }) => [
    actions.getCollection({ id: params.project }),
    actions.getFragments({ id: params.project }),
    actions.getTeams(),
    actions.getUsers(),
  ]),
  connect(
    (state, { params }) => {
      const currentUser = selectCurrentUser(state)
      const project = selectCollection(state, params.project)
      const versions = selectFragments(state, project.fragments)
      const version = selectFragment(state, params.version)
      const currentVersion = selectCurrentVersion(state, project)

      const handlingEditors = state.teams.find(team => (
        team.object.type === 'collection'
          && team.object.id === params.project
          && team.teamType.name === 'handlingEditor'
      )).members.map(id => selectUser(state, id))

      const reviewer = getReviewerFromUser(project, currentVersion, currentUser)

      return { project, versions, version, currentVersion, reviewer, handlingEditors }
    },
    {
      uploadFile
    }
  ),
  withProps(({ reviewer }) => {
    return {
      initialValues: reviewer,
    }
  }),
  reduxForm({
    form: 'review',
    onSubmit,
    onChange: debounce(onChange, 1000, { maxWait: 5000 })
  })
)(ReviewLayout)
