import React from 'react'
import PropTypes from 'prop-types'
import { Nav, Navbar, NavbarBrand, NavItem } from 'react-bootstrap'
import UpdateSubscriber from 'pubsweet-client/src/components/UpdateSubscriber'
import { connect } from 'react-redux'
import { logoutUser } from 'pubsweet-component-login/actions'

import './Navigation.css'

const Navigation = ({ logoutUser, currentUser }) => (
  <Navbar fluid fixedTop style={{ minHeight: 0 }}>
    <Navbar.Header>
      <NavbarBrand>
        <Navbar.Link href="/projects" className="navbar-link">xpub</Navbar.Link>
      </NavbarBrand>
    </Navbar.Header>

    {currentUser && (
      <Nav pullRight>
        <NavItem><UpdateSubscriber/></NavItem>
        <NavItem>logged in as {currentUser.username}</NavItem>
        <NavItem onClick={logoutUser}>logout</NavItem>
      </Nav>
    )}
  </Navbar>
)

Navigation.propTypes = {
  currentUser: PropTypes.object,
  logoutUser: PropTypes.func.isRequired
}

export default connect(
  state => ({
    currentUser: state.currentUser.isAuthenticated ? state.currentUser.user : null
  }),
  {
    logoutUser
  }
)(Navigation)

