import React from 'react'
import PropTypes from 'prop-types'
import NavigationContainer from '../containers/NavigationContainer'

const App = ({ children }) => (
  <div>
    <NavigationContainer/>
    {children}
  </div>
)

App.propTypes = {
  children: PropTypes.node
}

export default App
