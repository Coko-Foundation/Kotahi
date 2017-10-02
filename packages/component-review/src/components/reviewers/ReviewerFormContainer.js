import { find, some } from 'lodash'
import { compose, withHandlers } from 'recompose'
import { reduxForm, SubmissionError } from 'redux-form'
import { connect } from 'react-redux'
import { actions } from 'pubsweet-client'
import ReviewerForm from './ReviewerForm'

const getReviewer = (props, user) => {
  const reviewer = find(props.project.reviewers, { user: user.id })

  return reviewer ? Promise.resolve(reviewer) : addReviewer(props, user)
}

const addReviewer = (props, user) => {
  const reviewer = {
    user: user.id
  }

  return props.updateProject(props.project, {
    reviewers: [].concat(props.project.reviewers, reviewer)
  }).then(() => reviewer)
}

const addInvitation = (props, reviewer) => {
  const invitation = {
    reviewer: reviewer.id,
    status: 'invited',
    events: {
      invited: new Date()
    }
  }

  return props.updateVersion(props.project, {
    id: props.version.id,
    invitations: [].concat(props.version.invitations, invitation)
  }).then(() => invitation)
}

const handleSubmit = props => reset => values => {
  // TODO: create a user account if values.user.id is null

  return getReviewer(props, values.user).then(reviewer => {
    if (some(props.version.invitations, { reviewer: reviewer.id })) {
      throw new SubmissionError('This reviewer has already been added')
    }

    return addInvitation(props, reviewer)
  }).then(() => reset())
}

const loadOptions = props => input => {
  const options = props.reviewerUsers

  // TODO: put existing, uninvited project reviewers at the top

  // TODO: filter users based on input

  return Promise.resolve({ options })
}

export default compose(
  connect(null, {
    updateProject: actions.updateCollection,
    updateVersion: actions.updateFragment,
  }),
  withHandlers({
    loadOptions: props => loadOptions(props),
    onSubmit: props => handleSubmit(props),
  }),
  reduxForm({
    form: 'reviewers'
  })
)(ReviewerForm)