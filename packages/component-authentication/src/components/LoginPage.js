import { reduxForm, SubmissionError } from 'redux-form'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { login } from '../redux/login'
import Login from './Login'
import redirectPath from '../redirect'

const onSubmit = (values, dispatch, { history, location }) => {
  dispatch(login(values))
    .then(() => {
      history.push(redirectPath({ location }))
    })
    .catch(error => {
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
    form: 'login',
    onSubmit,
  }),
  connect(state => ({
    error: state.login.error,
  })),
)(Login)
