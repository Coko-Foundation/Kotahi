import React from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import { override, th, grid, darken } from '@pubsweet/ui-toolkit'

import { Icon, Action } from '@pubsweet/ui'
import { UserAvatar } from '../components/component-avatar/src'
import { Link } from 'react-router-dom'

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

const NavItem = ({ className, link, name, icon }) => (
  <Link className={className} to={link}>
    <Icon>{icon}</Icon>
    {name}
  </Link>
)

const Item = styled(NavItem)`
  border-radius: 10px;
  padding-left: ${grid(1)};
  height: ${grid(5)};
  line-height: ${grid(3)};

  display: flex;
  align-items: center;
  color: ${darken('colorSecondary', 0.5)};

  &:hover {
    color: ${th('colorText')};
    stroke: ${th('colorText')};
    background-color: ${th('colorBackgroundHue')};
  }

  svg {
    &:hover {

    }
    width: 1em;
    stroke: ${darken('colorSecondary', 0.5)};
  }

  ${props =>
    props.active &&
    css`
      background-color: ${th('colorFurniture')};
      color: ${th('colorText')};

      &:hover {
        background-color: ${th('colorFurniture')};
        color: ${th('colorText')};
      }
    `}
  // align-items: center;
  // display: inline-flex;
  // margin: calc(${th('gridUnit')} * 3) 1rem calc(${th('gridUnit')} * 3) 0;
`

const UserItem = styled.a`
  // height: ${grid(5)};
  line-height: ${grid(4)};
  display: flex;
  padding-bottom: ${grid(2)};
  // margin-bottom: ${grid(2)};
  // border-bottom: 1px solid ${th('colorFurniture')};
`

const Menu = ({ className, loginLink = '/login', navLinkComponents, user }) => (
  <Root className={className}>
    <Section>
      <UserComponent loginLink={loginLink} user={user} />

      {navLinkComponents &&
        navLinkComponents.map((navInfo, idx) => (
          <Item
            {...navInfo}
            active={window.location.pathname === navInfo.link}
            key={navInfo.link}
          />
        ))}
    </Section>
  </Root>
)

const UserComponent = ({ user, loginLink }) => (
  <Section>
    {user && (
      <UserItem href="/journal/profile">
        <UserAvatar user={user} />
        {user.defaultIdentity.name || user.username}
        {/* ({user.username}) */}
        {user.admin ? ' (admin)' : ''}
      </UserItem>
    )}
    {!user && <Item name="Login" link={loginLink} />}
  </Section>
)

Menu.propTypes = {
  brandLink: PropTypes.string,
  brand: PropTypes.node,
  loginLink: PropTypes.string,
  onLogoutClick: PropTypes.func,
  user: PropTypes.object,
  navLinkComponents: PropTypes.arrayOf(PropTypes.element),
}

export default Menu
