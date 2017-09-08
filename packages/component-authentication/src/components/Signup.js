import React from 'react'
import { Field } from 'redux-form'
import { Link } from 'react-router'
import { Button, TextField } from 'xpub-ui'
import classes from './Signup.local.scss'

const UsernameInput = props => <TextField {...props.input}/>
const EmailInput = props => <TextField {...props.input} type="email"/>
const PasswordInput = props => <TextField {...props.input} type="password"/>

const Signup = ({ error, handleSubmit }) => (
  <div className={classes.root}>
    <div className={classes.title}>
      Sign up
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
          Email
          <Field name="email" component={EmailInput}/>
        </label>
      </div>

      <div>
        <label>
          Password
          <Field name="password" component={PasswordInput}/>
        </label>
      </div>

      <div>
        <Button primary type="submit">Sign up</Button>
      </div>
    </form>

    <div>or <Link to="/login">login</Link></div>
  </div>
)

export default Signup
