import React from 'react'
import styled, { css } from 'styled-components'
// import PropTypes from 'prop-types'
import { th, grid, lighten } from '@pubsweet/ui-toolkit'
import { Link } from 'react-router-dom'
import { Icon } from '@pubsweet/ui'
import { UserAvatar } from '../components/component-avatar/src'

const Root = styled.nav`
  grid-area: menu;
  padding: ${grid(2)};
  // display: flex;
  // align-items: center;
  // justify-content: space-between;
  border-right: 1px solid ${th('colorFurniture')};
  // background: ${th('colorPrimary')};
  // background: linear-gradient(45deg, #191654, #43C6AC);
  background: linear-gradient(134deg, ${th('colorPrimary')}, ${lighten(
  'colorPrimary',
  0.3,
)});
  max-height: 100vh;
`

const Section = styled.div`
  // display: flex;
  // align-items: center;
`

// const Logo = styled.span`
//   // margin: ${grid(2)} 1rem ${grid(2)} 1rem;

//   ${override('ui.AppBar.Logo')};
// `

// const LogoLink = styled(Action)`
//   & > * {
//     height: calc(${th('gridUnit')} * 6);
//   }

//   ${override('ui.AppBar.LogoLink')};
// `

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
  color: ${th('colorTextReverse')};

  &:hover {
    color: ${th('colorText')};
    stroke: ${th('colorText')};
    background-color: ${lighten('colorPrimary', 0.5)};
    svg {
      stroke: ${th('colorText')};

    }
  }

  svg {
    &:hover {
    }
    width: 1em;
    stroke: ${th('colorTextReverse')};
  }

  ${props =>
    props.active &&
    css`
      background-color: ${lighten('colorBackgroundHue', 0)};
      color: ${th('colorText')};
      &:hover {
        background-color: ${th('colorFurniture')};
        color: ${th('colorText')};
      }
      svg {
        stroke: ${th('colorText')};
      }
    `}
  // align-items: center;
  // display: inline-flex;
  // margin: calc(${th('gridUnit')} * 3) 1rem calc(${th('gridUnit')} * 3) 0;
`

const UserItem = styled(Link)`
  // height: ${grid(5)};
  // line-height: ${grid(2)};
  color: ${th('colorTextReverse')};
  display: flex;
  padding-bottom: ${grid(2)};
  // margin-bottom: ${grid(2)};
  // border-bottom: 1px solid ${th('colorFurniture')};
`

const UserInfo = styled.div`
  margin-left: ${grid(1)};
  display: flex;
  justify-content: center;
  flex-direction: column;
`

const Menu = ({
  className,
  loginLink = '/login',
  navLinkComponents,
  user,
  notice,
}) => (
  <Root className={className}>
    <Section>
      {/* TODO: Place this notice (used for offline notification) better */}
      {notice}
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
      <UserItem title="Go to your profile" to="/journal/profile">
        <UserAvatar isClickable={false} size={48} user={user} />
        <UserInfo>
          <p>{user.defaultIdentity.name || user.username}</p>
          <p>{user.online ? '' : 'Offline'}</p>
          {/* ({user.username}) */}
          {user.admin ? ' (admin)' : ''}
        </UserInfo>
      </UserItem>
    )}
    {!user && <Item link={loginLink} name="Login" />}
  </Section>
)

// Menu.propTypes = {
//   brandLink: PropTypes.string,
//   brand: PropTypes.node,
//   loginLink: PropTypes.string,
//   onLogoutClick: PropTypes.func,
//   user: PropTypes.object,
//   navLinkComponents: PropTypes.arrayOf(PropTypes.element),
// }

export default Menu
