import { compose } from 'recompose'
import { connect } from 'react-redux'
import { reduxForm } from 'redux-form'
import { signupUser } from 'pubsweet-component-signup/actions'
import { Signup } from './Signup'

export default compose(
  reduxForm({
    form: 'signup'
  }),
  connect(
    state => ({
      signupError: state.error
    }),
    {
      onSubmit: signupUser
    }
  )
)(Signup)
