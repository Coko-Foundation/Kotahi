import React from 'react'
import classnames from 'classnames'
import { Field } from 'redux-form'
import classes from './Signup.local.css'

const Signup = ({ error, handleSubmit }) => (
  <div className={classes.root}>
    <div className={classes.title}>
      Sign up
    </div>

    {error && <div className={classes.error}>{error}</div>}

    <form
      onSubmit={handleSubmit}
      className={classnames({ error: !!error, success: !error })}>
      <div>
        <label>
          Username
          <Field name="username" component="input" type="text"/>
        </label>
      </div>

      <div>
        <label>
          Email
          <Field name="email" component="input" type="email"/>
        </label>
      </div>

      <div>
        <label>
          Password
          <Field name="password" component="input" type="password"/>
        </label>
      </div>

      <div>
        <button type="submit" className={classes.button}>Sign up</button>
      </div>
    </form>
  </div>
)

export default Signup
