import React from 'react'
import styled from 'styled-components'
import Menu from '../../app/components/Menu'

const Root = styled.div`
  display: grid;
  grid-template-areas: 'menu main';
  grid-template-columns: 200px auto;
  height: 100vh;
  max-height: 100vh;
  ${({ converting }) =>
    converting &&
    `
     button,
     a {
       pointer-events: none;
     }
  `};
  overflow: hidden;
  position: relative;
  z-index: 0;
`

export const Base = args => (
  <Root>
    <Menu {...args} />
  </Root>
)

Base.args = {
  brand: 'Kotahi',
  brandLink: '/kotahi/dashboard',
  className: '',
  loginLink: '/login?next=/kotahi/dashboard',
  navLinkComponents: [
    {
      link: '/kotahi/dashboard',
      name: 'Dashboard',
      icon: 'home',
    },
    {
      link: '/kotahi/admin/form-builder',
      name: 'Forms',
      icon: 'check-square',
    },
    {
      link: '/kotahi/admin/users',
      name: 'Users',
      icon: 'users',
    },
    {
      link: '/kotahi/admin/manuscripts',
      name: 'Manuscripts',
      icon: 'file-text',
    },
    {
      link: '/kotahi/admin/reports',
      name: 'Reports',
      icon: 'activity',
    },
    {
      link: '/kotahi/profile',
      name: 'My profile',
      icon: 'user',
    },
  ],
  notice: ' ',
  profileLink: '/kotahi/profile',
  user: {
    __typename: 'User',
    id: 'ed0d6990-b32a-4b32-8bf6-39bd20078643',
    profilePicture: null,
    username: 'Shanthi',
    admin: true,
    email: 'shanthitestemail@mailinator.com',
    defaultIdentity: {
      __typename: 'Identity',
      identifier: '0000-0002-2473-4784',
      email: null,
      type: 'orcid',
      aff: '',
      id: '7b03f794-ed3c-4dac-933d-a6616b3d70c2',
    },
    online: true,
    _currentRoles: [],
    teams: [],
  },
}

export default {
  title: 'Manuscripts/MenuBar',
  component: Menu,
}
