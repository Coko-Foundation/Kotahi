import { connect } from 'react-redux'
import { loginUser } from 'pubsweet-component-login/actions'
import { reduxForm } from 'redux-form'
import { compose } from 'recompose'
import { Login } from 'xpub-ui'

// TODO: const redirect = this.props.location.query.next | CONFIG['pubsweet-client']['login-redirect']

export default compose(
  reduxForm({
    form: 'login'
  }),
  connect(
    state => ({
      loginError: state.error
    }),
    {
      onSubmit: loginUser
    }
  )
)(Login)
