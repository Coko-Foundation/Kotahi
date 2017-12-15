import React from 'react'
import { Field } from 'redux-form'
import { Link } from 'react-router-dom'
import { Button, TextField } from '@pubsweet/ui'
import classes from './Form.local.scss'

const UsernameInput = props => <TextField label="Username" {...props.input} />
const EmailInput = props => (
  <TextField label="Email" {...props.input} type="email" />
)
const PasswordInput = props => (
  <TextField label="Password" {...props.input} type="password" />
)

const Signup = ({ errorMessage, handleSubmit }) => (
  <div className={classes.root}>
    <div className={classes.title}>Sign up</div>

    {errorMessage && <div className={classes.error}>{errorMessage}</div>}

    <form className={classes.form} onSubmit={handleSubmit}>
      <Field component={UsernameInput} name="username" />
      <Field component={EmailInput} name="email" />
      <Field component={PasswordInput} name="password" />
      <Button className={classes.button} primary type="submit">
        Sign up
      </Button>
    </form>

    <div className={classes.alternate}>
      <span className={classes.message}>Already have an account?</span>
      <Link className={classes.link} to="/login">
        Login
      </Link>
    </div>
  </div>
)

export default Signup
