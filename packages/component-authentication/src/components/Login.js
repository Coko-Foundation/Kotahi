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
      <div>
        <label>
          Username
          <Field name="username" component={UsernameInput}/>
        </label>
      </div>

      <div>
        <label>
          Password
          <Field name="password" component={PasswordInput}/>
        </label>
      </div>

      <div>
        <Button primary type="submit">Login</Button>
      </div>
    </form>

    <div>or <Link to="/signup">sign up</Link></div>
  </div>
)

export default Login
