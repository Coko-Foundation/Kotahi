import React from 'react'
import { Field } from 'redux-form'
import { Link } from 'react-router-dom'
import { Button, TextField } from 'xpub-ui'
import classes from './Form.local.scss'

const UsernameInput = props => (
  <TextField label="Username" {...props.input}/>
)
const EmailInput = props => (
  <TextField label="Email" {...props.input} type="email"/>
)
const PasswordInput = props => (
  <TextField label="Password" {...props.input} type="password"/>
)

const Signup = ({ errorMessage, handleSubmit }) => (
  <div className={classes.root}>
    <div className={classes.title}>
      Sign up
    </div>

    {errorMessage && <div className={classes.error}>{errorMessage}</div>}

    <form onSubmit={handleSubmit} className={classes.form}>
      <Field name="username" component={UsernameInput}/>
      <Field name="email" component={EmailInput}/>
      <Field name="password" component={PasswordInput}/>
      <Button primary type="submit" className={classes.button}>Sign up</Button>
    </form>

    <div className={classes.alternate}>
      <span className={classes.message}>
        Already have an account?
      </span>
      <Link to="/login" className={classes.link}>
        Login
      </Link>
    </div>
  </div>
)

export default Signup
