import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import classes from './ConnectPage.local.scss'

const ConnectPage = requirements => WrappedComponent => {
  class ConnectedComponent extends React.Component {
    state = {
      fetching: false,
      complete: false,
      error: null
    }

    componentDidMount () {
      this.fetch(this.props)
    }

    componentWillReceiveProps (nextProps) {
      this.fetch(nextProps)
    }

    fetch ({ isAuthenticated }) {
      if (!isAuthenticated) {
        return
      }

      if (this.state.fetching) {
        return
      }

      this.setState({
        fetching: true,
        complete: false
      })

      const requests = requirements(this.props).map(this.props.dispatch)

      Promise.all(requests).then(() => {
        this.setState({
          fetching: false,
          complete: true,
        })
      }).catch(error => {
        console.error(error)

        this.setState({
          error: error.message
        })

        throw error // rethrow
      })
    }

    render () {
      const { complete, error } = this.state

      if (error) return (
        <div className={classes.error}>{error}</div>
      )

      if (!complete) return (
        <div className={classes.bar}>loading…</div>
      )

      return <WrappedComponent {...this.props}/>
    }
  }

  return compose(
    withRouter,
    connect(
      state => ({
        isAuthenticated: state.currentUser.isAuthenticated
      })
    )
  )(ConnectedComponent)
}

export default ConnectPage
