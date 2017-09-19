import { debounce, filter } from 'lodash'
import { compose, withProps } from 'recompose'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { reduxForm, SubmissionError } from 'redux-form'
import actions from 'pubsweet-client/src/actions'
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

      const fragments = filter(state.fragments, fragment => project.fragments.includes(fragment.id))

      return {
        project,
        versions: filter(fragments, { type: 'version' }),
        reviews: filter(fragments, { type: 'review' }),
        // version: selectFragment(state, ownProps.params.version),
        // review: selectFragment(state, ownProps.params.review)
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
