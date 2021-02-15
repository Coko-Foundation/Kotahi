import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import config from 'config'
import { th, grid, lighten } from '@pubsweet/ui-toolkit'
import { Button } from '@pubsweet/ui'
import styled from 'styled-components'

const getNextUrl = () => {
  const url = new URL(window.location.href)

  // Where should we redirect after successful login?
  const redirectLink =
    (config['pubsweet-component-login'] &&
      config['pubsweet-component-login'].redirect) ||
    config['pubsweet-client']['login-redirect']

  return `${url.searchParams.get('next') || redirectLink}`
}

const getToken = props => {
  const { location } = props

  if (location && location.search && location.search.match(/^\?token=/)) {
    return location.search.replace(/^\?token=/, '')
  }

  return null
}

const LoginButton = styled(Button)`
  display: block;
  margin-top: ${grid(3)};
  width: 100%;
`

// TODO: Shared?
const Container = styled.div`
  background: linear-gradient(
    134deg,
    ${th('colorPrimary')},
    ${lighten('colorPrimary', 0.3)}
  );
  height: 100vh;
  display: grid;
  place-items: center;
`

const Content = styled.div`
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow')};
  padding: ${grid(4)};
  max-width: 40em;
  background: ${th('colorBackground')};
  text-align: center;

  h1 {
    margin-bottom: ${grid(2)};
  }
  margin-bottom: 1rem;
  img {
    max-width: 475px;
    max-height: 307px;
    width: auto;
    height: auto;
  }
`

const Centered = styled.div`
  text-align: center;
`

const ORCIDIcon = ({ className }) => (
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

const Login = ({ logo = null, ...props }) => {
  const token = getToken(props)
  // If a JWT token is supplied as a query param (e.g. from OAuth)
  // go ahead and fetch the redirect URL
  const initialRedirectLink = token ? getNextUrl() : null
  const [redirectLink] = useState(initialRedirectLink)

  if (token) {
    window.localStorage.setItem('token', token)
    return <Redirect to={redirectLink} />
  }

  const journalName = config.journal.metadata.name

  return redirectLink ? (
    <Redirect to={redirectLink} />
  ) : (
    <Container>
      <Centered>
        <Content>
          {journalName === 'Aperture' && (
            <img alt="Aperture" src="/public/logo-aperture.png" />
          )}
          {journalName === 'Kotahi' && (
            <img alt="Kotahi" src="/public/logo-kotahi.png" />
          )}
          <LoginButton
            onClick={() => (window.location = '/auth/orcid')}
            primary
          >
            Login with ORCID
          </LoginButton>
        </Content>
      </Centered>
    </Container>
  )
}

export default Login
