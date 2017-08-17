import React from 'react'
import PropTypes from 'prop-types'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { actions } from 'pubsweet-client'
import { withRouter } from 'react-router'

class AuthenticatedPage extends React.Component {
  componentDidMount () {
    const { isAuthenticated, getCurrentUser } = this.props

    if (!isAuthenticated) {
      getCurrentUser()
    }
  }

  componentWillReceiveProps (nextProps) {
    const { isAuthenticated, isFetching } = nextProps

    if (!isAuthenticated && !isFetching) {
      this.login()
    }
  }

  login () {
    const { location, push } = this.props

    push('/login?next=' + encodeURIComponent(location.pathname))
  }

  render () {
    const { isAuthenticated, children } = this.props

    return isAuthenticated ? children : null
  }
}

AuthenticatedPage.propTypes = {
  children: PropTypes.node.isRequired,
  getCurrentUser: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  push: PropTypes.func.isRequired
}

export default compose(
  connect(
    state => ({
      isAuthenticated: state.currentUser.isAuthenticated,
      isFetching: state.currentUser.isFetching
    }),
    {
      getCurrentUser: actions.getCurrentUser,
      push
    }
  ),
  withRouter
)(AuthenticatedPage)
