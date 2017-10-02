import { debounce } from 'lodash'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { reduxForm, SubmissionError } from 'redux-form'
import { actions } from 'pubsweet-client'
import { ConnectPage } from 'xpub-connect'
import { selectCollection } from 'xpub-selectors'
import uploadFile from 'xpub-upload'
import ReviewLayout from './review/ReviewLayout'

const onSubmit = (values, dispatch, props) => {
  console.log('submit', values)

  return dispatch(actions.updateFragment(props.project, {
    id: props.review.id,
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
    id: props.review.id,
    // submitted: false,
    ...values
  }))

  // TODO: display a notification when saving/saving completes/saving fails
}

export default compose(
  ConnectPage(({ params }) => [
    actions.getCollection({ id: params.project }),
    actions.getFragments({ id: params.project }),
    // actions.getFragment({ id: params.project }, { id: params.version }),
    // actions.getFragment({ id: params.project }, { id: params.review }),
  ]),
  connect(
    (state, ownProps) => {
      const project = selectCollection(state, ownProps.params.project)
      const versions = project.fragments.map(id => state.fragments[id])

      return {
        project,
        versions,
        // version: selectFragment(state, ownProps.params.version),
      }
    },
    {
      uploadFile
    }
  ),
  withProps(({ review }) => {
    return {
      initialValues: review,
    }
  }),
  reduxForm({
    form: 'review',
    onSubmit,
    onChange: debounce(onChange, 1000)
  })
)(ReviewLayout)
