import { reduxForm, SubmissionError } from 'redux-form'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { login } from '../redux/login'
import Login from './Login'

// TODO: const redirect = this.props.location.query.next | CONFIG['pubsweet-client']['login-redirect']

const onSubmit = (values, dispatch, { history }) => {
  dispatch(login(values)).then(() => {
    history.push('/') // TODO: state
  }).catch(error => {
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
    onSubmit
  }),
  connect(
    state => ({
      error: state.login.error
    })
  )
)(Login)
