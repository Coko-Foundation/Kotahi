import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { override, th, grid } from '@pubsweet/ui-toolkit'

import { Icon, Action } from '@pubsweet/ui'

const Root = styled.nav`
  grid-area: menu;
  padding: ${grid(2)};
  // display: flex;
  // align-items: center;
  // justify-content: space-between;
  border-right: 1px solid ${th('colorFurniture')};
  max-height: 100vh;
  // ${override('ui.AppBar')};
`

const Section = styled.div`
  // display: flex;
  // align-items: center;
`

const Logo = styled.span`
  // margin: ${grid(2)} 1rem ${grid(2)} 1rem;

  ${override('ui.AppBar.Logo')};
`

const LogoLink = styled(Action)`
  & > * {
    height: calc(${th('gridUnit')} * 6);
  }

  ${override('ui.AppBar.LogoLink')};
`

const Item = styled.div`
  // align-items: center;
  // display: inline-flex;
  // margin: calc(${th('gridUnit')} * 3) 1rem calc(${th('gridUnit')} * 3) 0;
`

const AppBar = ({
  brandLink = '/',
  brand,
  className,
  loginLink = '/login',
  onLogoutClick,
  navLinkComponents,
  user,
}) => (
  <Root className={className}>
    <Section>
      {brand && (
        <Logo>
          <LogoLink to={brandLink}>{brand}</LogoLink>
        </Logo>
      )}
      <UserComponent
        loginLink={loginLink}
        onLogoutClick={onLogoutClick}
        user={user}
      />

      {navLinkComponents &&
        navLinkComponents.map((NavLinkComponent, idx) => (
          <span key={NavLinkComponent.props.to}>
            <Item>{NavLinkComponent}</Item>
          </span>
        ))}
    </Section>
  </Root>
)

const UserComponent = ({ user, onLogoutClick, loginLink }) => (
  <Section>
    {user && (
      <Item>
        <Icon size={2}>user</Icon>
        {user.username}
        {user.admin ? ' (admin)' : ''}
      </Item>
    )}

    {user && (
      <Item>
        {/* <Icon size={2}>power</Icon> */}
        <Action onClick={onLogoutClick}>Logout</Action>
      </Item>
    )}

    {!user && (
      <Item>
        <Action to={loginLink}>Login</Action>
      </Item>
    )}
  </Section>
)

AppBar.propTypes = {
  brandLink: PropTypes.string,
  brand: PropTypes.node,
  loginLink: PropTypes.string,
  onLogoutClick: PropTypes.func,
  user: PropTypes.object,
  navLinkComponents: PropTypes.arrayOf(PropTypes.element),
}

export default AppBar
