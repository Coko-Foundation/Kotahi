import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import { withFormik } from 'formik'
import config from 'config'
import { th, grid } from '@pubsweet/ui-toolkit'
import { CenteredColumn, H1, Button } from '@pubsweet/ui'
import styled from 'styled-components'
import { Container, Content, Section } from '../../shared'

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

const LoginLink = styled.a`
  display: inline-block;
  background: ${th('colorPrimary')};
  border-radius: ${th('borderRadius')};
  line-height: ${grid(4)};
  color: ${th('colorTextReverse')};

  padding: ${grid(1)} ${grid(2)};
  margin-bottom: ${grid(1)};
  margin-top: ${grid(3)};
`

const CenteredSection = styled(Section)`
  text-align: center;
`

const ORCIDIcon = ({className}) => (
  <span className={className}>
  <svg viewBox="0 0 256 256">
    <path
      d="M256,128c0,70.7-57.3,128-128,128C57.3,256,0,198.7,0,128C0,57.3,57.3,0,128,0C198.7,0,256,57.3,256,128z"
      fill="#A6CE39"
    />
    <g>
      <path d="M86.3,186.2H70.9V79.1h15.4v48.4V186.2z" fill="#FFFFFF" />
      <path
        d="M108.9,79.1h41.6c39.6,0,57,28.3,57,53.6c0,27.5-21.5,53.6-56.8,53.6h-41.8V79.1z M124.3,172.4h24.5   c34.9,0,42.9-26.5,42.9-39.7c0-21.5-13.7-39.7-43.7-39.7h-23.7V172.4z"
        fill="#FFFFFF"
      />
      <path
        d="M88.7,56.8c0,5.5-4.5,10.1-10.1,10.1c-5.6,0-10.1-4.6-10.1-10.1c0-5.6,4.5-10.1,10.1-10.1   C84.2,46.7,88.7,51.3,88.7,56.8z"
        fill="#FFFFFF"
      />
    </g>
  </svg>
  </span>
)

const StyledORCIDIcon = styled(ORCIDIcon)`
  svg {
    height: 1rem;
  }
`
const Login = ({ logo = null, redirectLink, orcid, token, ...props }) => {
  if (token) {
    window.localStorage.setItem('token', token)
    return <Redirect to={redirectLink} />
  }

  return redirectLink ? (
    <Redirect to={redirectLink} />
  ) : (
    <Container>
      <H1>Login to SimpleJ</H1>
      <Content>
      <CenteredSection>

          SimpleJ uses ORCID <StyledORCIDIcon /> to identify authors and staff. Login with your
          ORCID account below or{' '}
          <a href="https://orcid.org/signin">register at the ORCID website.</a>
        <LoginLink href="/auth/orcid" primary>
          Login with ORCID
        </LoginLink>
        </CenteredSection>

      </Content>

    </Container>
  )
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

  return (
    <EnhancedFormik
      onLoggedIn={onLoggedIn}
      orcid={orcid}
      redirectLink={redirectLink}
      token={token}
      {...props}
    />
  )
}
