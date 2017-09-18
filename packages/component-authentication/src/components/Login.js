import React from 'react'
import { Field } from 'redux-form'
import { Link } from 'react-router'
import { Button, TextField } from 'xpub-ui'
import classes from './Form.local.scss'

const UsernameInput = props => (
  <TextField label="Username" {...props.input}/>
)
const PasswordInput = props => (
  <TextField label="Password" {...props.input} type="password"/>
)

const Login = ({ error, handleSubmit }) => (
  <div className={classes.root}>
    <div className={classes.title}>
      Login
    </div>

    {error && <div className={classes.error}>{error.message}</div>}

    <form onSubmit={handleSubmit} className={classes.form}>
      <Field name="username" component={UsernameInput}/>
      <Field name="password" component={PasswordInput}/>
      <Button primary type="submit" className={classes.button}>Login</Button>
    </form>

    <div className={classes.alternate}>
      <span className={classes.message}>
        You don't have an account?
      </span>
      <Link to="/signup" className={classes.link}>
        Sign up
      </Link>
    </div>
  </div>
)

export default Login
