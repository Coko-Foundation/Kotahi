import React from 'react'
import { Field } from 'redux-form'
import { Link } from 'react-router-dom'
import { Button, TextField } from 'xpub-ui'
import classes from './Form.local.scss'

const UsernameInput = props => <TextField label="Username" {...props.input} />
const PasswordInput = props => (
  <TextField label="Password" {...props.input} type="password" />
)

const Login = ({ errorMessage, handleSubmit }) => (
  <div className={classes.root}>
    <div className={classes.title}>Login</div>

    {errorMessage && <div className={classes.error}>{errorMessage}</div>}

    <form className={classes.form} onSubmit={handleSubmit}>
      <Field component={UsernameInput} name="username" />
      <Field component={PasswordInput} name="password" />
      <Button className={classes.button} primary type="submit">
        Login
      </Button>
    </form>

    <div className={classes.alternate}>
      <span className={classes.message}>You don&apos;t have an account?</span>
      <Link className={classes.link} to="/signup">
        Sign up
      </Link>
    </div>
  </div>
)

export default Login
