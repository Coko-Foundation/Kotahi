import React from 'react'
import classnames from 'classnames'
import { Field } from 'redux-form'
import classes from './Login.local.css'

const Login = ({ loginError, handleSubmit }) => (
  <div className={classes.root}>
    <div className={classes.title}>
      Login
    </div>

    {loginError && <div className={classes.error}>{loginError}</div>}

    <form
      onSubmit={handleSubmit}
      className={classnames({ error: !!loginError, success: !loginError })}>
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
  </div>
)

export default Login
