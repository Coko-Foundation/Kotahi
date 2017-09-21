import { find, some } from 'lodash'
import { compose, withHandlers } from 'recompose'
import { reduxForm, SubmissionError } from 'redux-form'
import { connect } from 'react-redux'
import actions from 'pubsweet-client/src/actions'
import ReviewerForm from './ReviewerForm'

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

const addReviewer = (props, projectReviewer) => {
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

const handleSubmit = props => reset => values => {
  // TODO: create a user account if values.user.id is null

  return getProjectReviewer(props, values.user).then(projectReviewer => {
    if (some(props.reviewers, { projectReviewer: projectReviewer.id })) {
      throw new SubmissionError('This reviewer has already been added')
    }

    return addReviewer(props, projectReviewer)
  }).then(() => reset())
}

const loadOptions = props => input => {
  const options = props.reviewerUsers

  // TODO: put existing, uninvited projectReviewers at the top

  // TODO: filter users based on input

  return Promise.resolve({ options })
}

export default compose(
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
