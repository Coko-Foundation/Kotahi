import React from 'react'
import PropTypes from 'prop-types'
import { Nav, Navbar, NavbarBrand, NavItem } from 'react-bootstrap'
import UpdateSubscriber from 'pubsweet-client/src/components/UpdateSubscriber'
import { bindActionCreators } from 'redux'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import actions from 'pubsweet-client/src/actions'

import './Navigation.css'

const Navigation = ({ actions, currentUser }) => (
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
        <NavItem onClick={actions.logoutUser}>logout</NavItem>
      </Nav>
    )}
  </Navbar>
)

Navigation.propTypes = {
  actions: PropTypes.object.isRequired,
  currentUser: PropTypes.object
}

export default withRouter(connect(
  state => ({
    currentUser: state.currentUser && state.currentUser.isAuthenticated ? state.currentUser.user : null
  }),
  dispatch => ({
    actions: bindActionCreators(actions, dispatch)
  })
)(Navigation))

