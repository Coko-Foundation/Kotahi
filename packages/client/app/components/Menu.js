import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { th, grid } from '@pubsweet/ui-toolkit'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@pubsweet/ui'
import { useTranslation } from 'react-i18next'
import { UserAvatar } from './component-avatar/src'
import { color } from '../theme'
import { convertCamelCaseToTitleCase } from '../shared/textUtils'

const Root = styled.nav`
  background: linear-gradient(
    134deg,
    ${color.brand1.base},
    ${color.brand1.tint25}
  );
  border-right: 1px solid ${color.gray90};
  /* stylelint-disable-next-line declaration-no-important */
  font-family: ${th('fontInterface')}, sans-serif !important;
  grid-area: menu;
  max-height: 100vh;
  padding: ${grid(2)};
`

const UserName = styled.div`
  word-break: break-word;
`

const NonLink = styled.div``

const Section = styled.div``

const RolesLabel = styled.div`
  color: ${color.brand1.tint50};
  font-size: ${th('fontSizeBaseSmall')};
  font-weight: normal;
  line-height: ${th('lineHeightBaseSmall')};
`

const AlertIndicator = styled.div`
  background: ${color.error.base};
  border-radius: 50%;
  height: 10px;
  margin: 0 0.5em;
  width: 10px;
`

const NavItem = ({
  className,
  link,
  name,
  icon,
  onClick,
  open,
  menu,
  hasAlert,
}) =>
  link ? (
    <Link className={className} onClick={onClick} to={link}>
      <span>
        {icon && <Icon>{icon}</Icon>}
        {name}
        {hasAlert && <AlertIndicator />}
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
  background-color: ${props => (props.active ? color.backgroundC : 'unset')};
  border-radius: 10px;
  /* stylelint-disable-next-line declaration-no-important */
  color: ${props => (props.active ? color.text : color.textReverse)} !important;
  display: flex;
  /* stylelint-disable-next-line declaration-no-important */
  font-size: ${th('fontSizeBase')} !important;
  height: ${grid(5)};
  justify-content: space-between;
  line-height: ${grid(3)};
  margin-left: ${props => grid((props.depth || 0) * 2)};
  padding-left: ${grid(1)};
  /* stylelint-disable-next-line declaration-no-important */
  text-decoration: none !important;

  & > span {
    align-items: center;
    display: flex;
    line-height: 1;
  }

  svg {
    stroke: ${props => (props.active ? color.text : color.textReverse)};
    width: 1em;
  }

  &:hover {
    background-color: ${color.brand1.tint50};
    /* stylelint-disable-next-line declaration-no-important */
    color: ${color.text} !important;
    stroke: ${color.text};

    svg {
      stroke: ${color.text};
    }
  }
`

const UserItem = styled(Link)`
  color: ${color.textReverse};
  display: flex;
  padding-bottom: ${grid(2)};
  /* stylelint-disable-next-line declaration-no-important */
  text-decoration: none !important;

  &:hover {
    /* stylelint-disable-next-line declaration-no-important */
    color: ${color.textReverse} !important;
  }
`

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  /* stylelint-disable-next-line declaration-no-important */
  font-size: ${th('fontSizeBase')} !important;
  justify-content: center;
  margin-left: ${grid(1)};
`

const SubMenu = ({ location, depth = 0, ...navInfo }) => {
  const [open, setOpen] = React.useState(
    menuItemContainsCurrentPage(navInfo, location),
  )

  return (
    <>
      <Item
        {...navInfo}
        active={location.pathname === navInfo.link}
        depth={depth}
        onClick={() => setOpen(!open)}
        open={open}
      />
      {open &&
        navInfo.links.map(subNavInfo => {
          if (subNavInfo.menu) {
            return (
              <SubMenu
                depth={depth + 1}
                key={subNavInfo.name}
                location={location}
                {...subNavInfo}
              />
            )
          }

          return (
            <Item
              {...subNavInfo}
              active={location.pathname === subNavInfo.link}
              depth={depth + 1}
              key={subNavInfo.link}
            />
          )
        })}
    </>
  )
}

const menuItemContainsCurrentPage = (item, location) =>
  item.link === location.pathname ||
  item.links?.some(subItem => menuItemContainsCurrentPage(subItem, location))

const Menu = ({
  className,
  loginLink = '/login',
  navLinkComponents,
  user,
  notice,
  profileLink,
}) => {
  const location = useLocation()
  const { t } = useTranslation()
  return (
    <Root className={className} data-testid="menu-container">
      <Section>
        {/* TODO: Place this notice (used for offline notification) better */}
        {notice}
        <UserComponent
          loginLink={loginLink}
          profileLink={profileLink}
          t={t}
          user={user}
        />
        {navLinkComponents &&
          navLinkComponents.map(navInfo =>
            navInfo.menu ? (
              <SubMenu key={navInfo.name} location={location} {...navInfo} />
            ) : (
              <Item
                {...navInfo}
                active={location.pathname.includes(navInfo.link)}
                key={navInfo.link}
              />
            ),
          )}
      </Section>
    </Root>
  )
}

const FormattedGlobalAndGroupRoles = ({ user, t }) => {
  const allRoles = user.globalRoles.concat(user.groupRoles)

  let unCamelCasedRoles =
    allRoles.includes('groupManager') || allRoles.includes('admin')
      ? allRoles
          .filter(role => role !== 'user')
          .map(role => convertCamelCaseToTitleCase(role))
      : allRoles.map(role => convertCamelCaseToTitleCase(role))

  if (!unCamelCasedRoles.length) return null
  unCamelCasedRoles = unCamelCasedRoles.map(elem => {
    return t(`common.roles.${elem}`)
  })
  return <RolesLabel>({unCamelCasedRoles.join(', ')})</RolesLabel>
}

const UserComponent = ({ user, loginLink, profileLink, t }) => (
  <Section>
    {user && (
      <UserItem title={t('leftMenu.Go to your profile')} to={profileLink}>
        <UserAvatar isClickable={false} size={48} user={user} />
        <UserInfo>
          <UserName>{user.username}</UserName>
          <span>{user.isOnline ? '' : 'Offline'}</span>
          {/* ({user.username}) */}
          <FormattedGlobalAndGroupRoles t={t} user={user} />
        </UserInfo>
      </UserItem>
    )}
    {!user && <Item icon="logIn" link={loginLink} name="Login" />}
  </Section>
)

Menu.propTypes = {
  className: PropTypes.string.isRequired,
  loginLink: PropTypes.string.isRequired,
  navLinkComponents: PropTypes.arrayOf(PropTypes.object).isRequired, // eslint-disable-line react/forbid-prop-types
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
