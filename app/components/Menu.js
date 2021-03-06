import React from 'react'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import { th, grid, lighten } from '@pubsweet/ui-toolkit'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@pubsweet/ui'
import { UserAvatar } from './component-avatar/src'

const Root = styled.nav`
  background: linear-gradient(
    134deg,
    ${th('colorPrimary')},
    ${lighten('colorPrimary', 0.3)}
  );
  border-right: 1px solid ${th('colorFurniture')};
  grid-area: menu;
  max-height: 100vh;
  padding: ${grid(2)};
`

const Section = styled.div``

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

NavItem.propTypes = {
  className: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
}

const Item = styled(NavItem)`
  align-items: center;
  border-radius: 10px;
  color: ${th('colorTextReverse')};
  display: flex;
  height: ${grid(5)};
  line-height: ${grid(3)};

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

  padding-left: ${grid(1)};

  svg {
    stroke: ${th('colorTextReverse')};
    width: 1em;
  }

  &:hover {
    background-color: ${lighten('colorPrimary', 0.5)};
    color: ${th('colorText')};
    stroke: ${th('colorText')};

    svg {
      stroke: ${th('colorText')};
    }
  }
`

const UserItem = styled(Link)`
  color: ${th('colorTextReverse')};
  display: flex;
  padding-bottom: ${grid(2)};
`

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: ${grid(1)};
`

const Menu = ({
  className,
  loginLink = '/login',
  navLinkComponents,
  user,
  notice,
  profileLink,
}) => {
  const location = useLocation()
  return (
    <Root className={className}>
      <Section>
        {/* TODO: Place this notice (used for offline notification) better */}
        {notice}
        <UserComponent
          loginLink={loginLink}
          profileLink={profileLink}
          user={user}
        />
        {navLinkComponents &&
          navLinkComponents.map((navInfo, idx) => (
            <Item
              {...navInfo}
              active={location.pathname === navInfo.link}
              key={navInfo.link}
            />
          ))}
      </Section>
    </Root>
  )
}

const UserComponent = ({ user, loginLink, profileLink }) => (
  <Section>
    {user && (
      <UserItem title="Go to your profile" to={profileLink}>
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

Menu.propTypes = {
  className: PropTypes.string.isRequired,
  loginLink: PropTypes.string.isRequired,
  navLinkComponents: PropTypes.arrayOf(PropTypes.object).isRequired,
  user: PropTypes.oneOfType([PropTypes.object]),
  notice: PropTypes.node.isRequired,
  profileLink: PropTypes.string.isRequired,
}

Menu.defaultProps = {
  user: undefined,
}

UserComponent.propTypes = {
  user: PropTypes.oneOfType([PropTypes.object]),
  loginLink: PropTypes.string.isRequired,
  profileLink: PropTypes.string.isRequired,
}

UserComponent.defaultProps = {
  user: undefined,
}

export default Menu
