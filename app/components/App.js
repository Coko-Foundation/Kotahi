import React from 'react'
import PropTypes from 'prop-types'
import Navigation from './Navigation'

const App = ({ children }) => (
  <div>
    <Navigation/>
    {children}
  </div>
)

App.propTypes = {
  children: PropTypes.node
}

export default App
