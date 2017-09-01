import React from 'react'
import { Field } from 'redux-form'
import { Link } from 'react-router'
import classes from './Login.local.scss'

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
          <Field name="username" component="input" type="text"/>
        </label>
      </div>

      <div>
        <label>
          Password
          <Field name="password" component="input" type="password"/>
        </label>
      </div>

      <div>
        <button type="submit" className={classes.button}>Login</button>
      </div>
    </form>

    <div>or <Link to="/signup">sign up</Link></div>
  </div>
)

export default Login
