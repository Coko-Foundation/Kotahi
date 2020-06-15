import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { withFormik, Field } from 'formik'
import { isEmpty } from 'lodash'
import config from 'config'
import { override } from '@pubsweet/ui-toolkit'
import { useMutation } from '@apollo/react-hooks'

import {
  CenteredColumn,
  ErrorText,
  H1,
  Link,
  Button,
  TextField,
} from '@pubsweet/ui'
import styled from 'styled-components'

import { LOGIN_USER } from './graphql/mutations'

const getNextUrl = () => {
  const url = new URL(window.location.href)

  // Where should we redirect after successful login?
  const redirectLink =
    (config['pubsweet-component-login'] &&
      config['pubsweet-component-login'].redirect) ||
    config['pubsweet-client']['login-redirect']

  return `${url.searchParams.get('next') || redirectLink}`
}

const localStorage = window.localStorage || undefined

const handleSubmit = (values, { props, setSubmitting, setErrors }) =>
  props
    .loginUser({ variables: { input: values } })
    .then(({ data, errors }) => {
      if (!errors) {
        localStorage.setItem('token', data.loginUser.token)
        setTimeout(() => {
          props.onLoggedIn(getNextUrl())
        }, 100)
      }
    })
    .catch(e => {
      if (e.graphQLErrors && e.graphQLErrors.length > 0) {
        setSubmitting(false)
        setErrors(e.graphQLErrors[0].message)
      }
    })

const getToken = props => {
  const { location } = props
  if (location && location.search && location.search.match(/^\?token=/)) {
    return location.search.replace(/^\?token=/, '')
  }
  return null
}

const Logo = styled.div`
  ${override('Login.Logo')};
`
Logo.displayName = 'Logo'

const FormContainer = styled.div`
  ${override('Login.FormContainer')};
`

const UsernameInput = props => (
  <TextField label="Username" placeholder="Username" {...props.field} />
)

const PasswordInput = props => (
  <TextField
    label="Password"
    placeholder="Password"
    {...props.field}
    type="password"
  />
)

const Login = ({
  errors,
  logo = null,
  signup = true,
  passwordReset = true,
  redirectLink,
  handleSubmit,
  orcid,
  token,
  ...props
}) => {
  if (token) {
    window.localStorage.setItem('token', token)
    return <Redirect to={redirectLink} />
  }

  return redirectLink ? (
    <Redirect to={redirectLink} />
  ) : (
    <CenteredColumn small>
      {logo && (
        <Logo>
          <img alt="pubsweet-logo" src={`${logo}`} />
        </Logo>
      )}
      <FormContainer>
        <H1>Login to SimpleJ</H1>

        {!isEmpty(errors) && <ErrorText>{errors}</ErrorText>}
        <form onSubmit={handleSubmit}>
          {/* <Field component={UsernameInput} name="username" />
          <Field component={PasswordInput} name="password" /> */}
          <a href="/auth/orcid">
          <Button primary>
            Login with ORCID
          </Button>
          </a>
        </form>

        {/* {signup && (
          <p>
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>
        )} */}

        {/* {passwordReset && (
          <p>
            Forgot your password?{' '}
            <Link to="/password-reset">Reset password</Link>
          </p>
        )} */}
      </FormContainer>
    </CenteredColumn>
  )
}

Login.propTypes = {
  error: PropTypes.string,
  actions: PropTypes.object,
  location: PropTypes.object,
  signup: PropTypes.bool,
  passwordReset: PropTypes.bool,
  logo: PropTypes.string,
}

const EnhancedFormik = withFormik({
  initialValues: {
    username: '',
    password: '',
  },
  mapPropsToValues: props => ({
    username: props.username,
    password: props.password,
  }),
  displayName: 'login',
  handleSubmit,
})(Login)

export default props => {
  // Is ORCID authentication enabled?
  const orcid =
    config['pubsweet-component-login'] &&
    config['pubsweet-component-login'].orcid

  const token = getToken(props)
  // If a JWT token is supplied as a query param (e.g. from OAuth)
  // go ahead and fetch the redirect URL
  const initialRedirectLink = token ? getNextUrl() : null
  const [redirectLink, setRedirectLink] = useState(initialRedirectLink)
  // Also set the redirect link upon successful login (via handleSubmit)
  const onLoggedIn = () => setRedirectLink(getNextUrl())

  const [loginUser] = useMutation(LOGIN_USER)
  return (
    <EnhancedFormik
      loginUser={loginUser}
      onLoggedIn={onLoggedIn}
      orcid={orcid}
      redirectLink={redirectLink}
      token={token}
      {...props}
    />
  )
}
