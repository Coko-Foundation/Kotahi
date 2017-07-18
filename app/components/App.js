import React from 'react'
import PropTypes from 'prop-types'
import NavigationContainer from './NavigationContainer'

const App = ({ children }) => (
  <div>
    <NavigationContainer/>
    <div style={{marginTop: 50}}>
      {children}
    </div>
  </div>
)

App.propTypes = {
  children: PropTypes.node
}

export default App
