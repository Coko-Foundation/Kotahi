import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { getUser } from 'pubsweet-client/src/actions/current_user'
import { withRouter } from 'react-router'

class AuthenticatedContainer extends React.Component {
  componentDidMount () {
    const { isAuthenticated, getUser } = this.props

    if (!isAuthenticated) {
      getUser()
    }
  }

  componentWillReceiveProps (nextProps) {
    const { isAuthenticated } = nextProps

    if (!isAuthenticated) {
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

AuthenticatedContainer.propTypes = {
  children: PropTypes.node.isRequired,
  getUser: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  push: PropTypes.func.isRequired
}

export default withRouter(connect(
  state => ({
    isAuthenticated: state.currentUser.isAuthenticated
  }),
  {
    getUser,
    push
  }
)(AuthenticatedContainer))
