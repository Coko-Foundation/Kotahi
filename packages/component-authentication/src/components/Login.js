import React from 'react'
import { Field } from 'redux-form'
import { Link } from 'react-router'
import { Button, TextField } from 'xpub-ui'
import classes from './Login.local.scss'

const UsernameInput = props => <TextField {...props.input}/>
const PasswordInput = props => <TextField {...props.input} type="password"/>

const Login = ({ error, handleSubmit }) => (
  <div className={classes.root}>
    <div className={classes.title}>
      Login
    </div>

    {error && <div className={classes.error}>{error.message}</div>}

    <form onSubmit={handleSubmit}>
    
        <label>
          Username
          <Field name="username" component={UsernameInput}/>
        </label>
    
        <label>
          Password
          <Field name="password" component={PasswordInput}/>
        </label>
        <Button primary type="submit">Login</Button>
    </form>
    <div>You don't have an account? <Link to="/signup">Sign up</Link></div>
  </div>
)

export default Login
