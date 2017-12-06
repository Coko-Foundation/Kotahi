import { connect } from 'react-redux'
import { compose } from 'recompose'
import { reduxForm, SubmissionError } from 'redux-form'
import { signup } from '../redux/signup'
import Signup from './Signup'

const onSubmit = (values, dispatch) => {
  dispatch(signup(values)).catch(error => {
    if (error.validationErrors) {
      throw new SubmissionError(error.validationErrors)
    } else {
      console.error(error)
      // TODO: display error
    }
  })
}

export default compose(
  reduxForm({
    form: 'signup',
    onSubmit,
  }),
  connect(state => ({
    error: state.signup.error,
  })),
)(Signup)
