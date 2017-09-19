import { filter, find, some } from 'lodash'
import { compose, withHandlers, withProps } from 'recompose'
import { connect } from 'react-redux'
import { reduxForm, SubmissionError } from 'redux-form'
import actions from 'pubsweet-client/src/actions'
import { ConnectPage } from 'xpub-connect'
import { selectCollection, selectFragment } from 'xpub-selectors'
import Reviewers from './reviewers/Reviewers'
import ReviewerForm from './reviewers/ReviewerForm'
import Reviewer from './reviewers/Reviewer'

const getProjectReviewer = (props, user) => {
  const projectReviewer = find(props.projectReviewers, { user: user.id })

  return projectReviewer ? Promise.resolve(projectReviewer) : addProjectReviewer(props, user)
}

const addProjectReviewer = (props, user) => {
  return props.createFragment(props.project, {
    fragmentType: 'projectReviewer',
    user: user.id,
  }).then(result => result.fragment)
}

const addReview = (props, projectReviewer) => {
  return props.createFragment(props.project, {
    fragmentType: 'reviewer',
    parentVersion: props.version.id,
    projectReviewer: projectReviewer.id,
    status: 'invited',
    events: {
      invited: new Date()
    }
  })
}

const handleSubmit = props => values => {
  // TODO: create a user account if values.user.id is null

  return getProjectReviewer(props, values.user).then(projectReviewer => {
    if (some(props.reviewers, { projectReviewer: projectReviewer.id })) {
      throw new SubmissionError('This reviewer has already been added')
    }

    return addReview(props, projectReviewer)
  })
}

const removeReviewer = props => () => {
  const id = props.reviewer.id

  return props.deleteFragment(props.project, { id })
}

const loadOptions = props => input => {
  const options = props.reviewerUsers

  // TODO: put existing, uninvited projectReviewers at the top

  // TODO: filter users based on input

  return Promise.resolve({ options })
}

const Form = compose(
  connect(null, {
    createFragment: actions.createFragment,
  }),
  withHandlers({
    loadOptions: props => loadOptions(props),
    onSubmit: props => handleSubmit(props),
  }),
  reduxForm({
    form: 'reviewers'
  })
)(ReviewerForm)

const Item = compose(
  connect(null, {
    deleteFragment: actions.deleteFragment
  }),
  withHandlers({
    removeReviewer: props => removeReviewer(props)
  })
)(Reviewer)

export default compose(
  ConnectPage(({ params }) => [
    actions.getCollection({ id: params.project }),
    actions.getFragments({ id: params.project }),
    // actions.getTeams(),
    actions.getUsers(),
    // actions.getFragment({ id: params.project }, { id: params.version }),
  ]),
  connect(
    (state, ownProps) => {
      const project = selectCollection(state, ownProps.params.project)
      const version = selectFragment(state, ownProps.params.version)

      const fragments = filter(state.fragments, fragment => {
        return project.fragments.includes(fragment.id)
      })

      const versions = filter(fragments, { fragmentType: 'version' })
      const projectReviewers = filter(fragments, { fragmentType: 'projectReviewer' })
      const reviewers = filter(fragments, { fragmentType: 'reviewer' })

      const reviewerUsers = state.users.users
      // const reviewerUsers = filter(state.users.users, { reviewer: true })

      // populate the reviewer user
      reviewers.forEach(reviewer => {
        const projectReviewer = find(projectReviewers, { id: reviewer.projectReviewer })

        if (projectReviewer) {
          reviewer._user = find(reviewerUsers, { id: projectReviewer.user })
        }
      })

      return {
        project,
        version,
        versions,
        projectReviewers,
        reviewers,
        reviewerUsers,
        // teams: state.teams,
      }
    }
  ),
  withProps({
    Form,
    Item
  })
)(Reviewers)
