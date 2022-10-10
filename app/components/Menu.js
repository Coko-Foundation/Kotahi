import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { th, grid } from '@pubsweet/ui-toolkit'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@pubsweet/ui'
import { UserAvatar } from './component-avatar/src'
import lightenBy from '../shared/lightenBy'

const Root = styled.nav`
  background: linear-gradient(
    134deg,
    ${th('colorPrimary')},
    ${lightenBy('colorPrimary', 0.3)}
  );
  border-right: 1px solid ${th('colorFurniture')};
  grid-area: menu;
  max-height: 100vh;
  padding: ${grid(2)};
`

const UserName = styled.div`
  word-break: break-word;
`

const NonLink = styled.div``

const Section = styled.div``

const NavItem = ({ className, link, name, icon, onClick, open, menu }) =>
  link ? (
    <Link className={className} onClick={onClick} to={link}>
      <span>
        {icon && <Icon>{icon}</Icon>}
        {name}
      </span>
      {menu ? (
        <> {open ? <Icon>chevron-up</Icon> : <Icon>chevron-down</Icon>} </>
      ) : null}
    </Link>
  ) : (
    <NonLink className={className} onClick={onClick}>
      <span>
        {icon && <Icon>{icon}</Icon>}
        {name}
      </span>
      {menu ? (
        <> {open ? <Icon>chevron-up</Icon> : <Icon>chevron-down</Icon>} </>
      ) : null}
    </NonLink>
  )

NavItem.propTypes = {
  className: PropTypes.string.isRequired,
  link: PropTypes.string,
  name: PropTypes.string.isRequired,
  icon: PropTypes.string,
}

NavItem.defaultProps = {
  icon: undefined,
  link: undefined,
}

export const Item = styled(NavItem)`
  align-items: center;
  background-color: ${props =>
    props.active ? th('colorBackgroundHue') : 'unset'};
  border-radius: 10px;
  color: ${props => (props.active ? th('colorText') : th('colorTextReverse'))};
  display: flex;
  height: ${grid(5)};
  justify-content: space-between;
  line-height: ${grid(3)};
  margin-left: ${props => (props.subLink ? '16px' : 0)};
  padding-left: ${grid(1)};

  & > span {
    align-items: center;
    display: flex;
  }

  svg {
    stroke: ${props =>
      props.active ? th('colorText') : th('colorTextReverse')};
    width: 1em;
  }

  &:hover {
    background-color: ${lightenBy('colorPrimary', 0.5)};
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

const SubMenu = ({ location, ...navInfo }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Item
        {...navInfo}
        active={menuItemIsActive(location, navInfo)}
        onClick={() => setOpen(!open)}
        open={open}
      />
      {open &&
        navInfo.links.map(subNavInfo => {
          if (subNavInfo.menu) {
            return (
              <SubMenu
                key={subNavInfo.link}
                location={location}
                {...subNavInfo}
                subLink
              />
            )
          }

          return (
            <Item
              {...subNavInfo}
              active={location.pathname === subNavInfo.link}
              key={subNavInfo.link}
              subLink
            />
          )
        })}
    </>
  )
}

const menuItemIsActive = (location, item) =>
  item.link === location.pathname ||
  item.links?.some(subItem => menuItemIsActive(location, subItem))

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
    <Root className={className} data-testid="menu-container">
      <Section>
        {/* TODO: Place this notice (used for offline notification) better */}
        {notice}
        <UserComponent
          loginLink={loginLink}
          profileLink={profileLink}
          user={user}
        />
        {navLinkComponents &&
          navLinkComponents.map(navInfo =>
            navInfo.menu ? (
              <SubMenu key={navInfo.name} location={location} {...navInfo} />
            ) : (
              <Item
                {...navInfo}
                active={location.pathname === navInfo.link}
                key={navInfo.link}
              />
            ),
          )}
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
          <UserName>{user.username}</UserName>
          <p>{user.isOnline ? '' : 'Offline'}</p>
          {/* ({user.username}) */}
          {user.admin ? ' (admin)' : ''}
        </UserInfo>
      </UserItem>
    )}
    {!user && <Item icon="logIn" link={loginLink} name="Login" />}
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
