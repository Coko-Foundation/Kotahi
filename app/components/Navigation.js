import React from 'react'
import PropTypes from 'prop-types'
import { Nav, Navbar, NavbarBrand, NavItem } from 'react-bootstrap'

import './Navigation.css'

const Navigation = ({ appLink, appName, logout, currentUser, updateSubscriber }) => (
  <Navbar fluid fixedTop style={{ minHeight: 0 }}>
    <Navbar.Header>
      <NavbarBrand>
        <Navbar.Link href={appLink}>{appName}</Navbar.Link>
      </NavbarBrand>
    </Navbar.Header>

    {currentUser ? (
      <Nav pullRight>
        {updateSubscriber && <NavItem>{updateSubscriber}</NavItem>}
        <NavItem>logged in as {currentUser.username}</NavItem>
        <NavItem onClick={logout}>logout</NavItem>
      </Nav>
    ) : (
      <Nav pullRight>
        <NavItem>
          <Navbar.Link href="/signin">login</Navbar.Link>
        </NavItem>
      </Nav>
    )}
  </Navbar>
)

Navigation.propTypes = {
  appLink: PropTypes.string.isRequired,
  appName: PropTypes.string.isRequired,
  currentUser: PropTypes.object,
  logout: PropTypes.func.isRequired,
  updateSubscriber: PropTypes.node
}

export default Navigation
