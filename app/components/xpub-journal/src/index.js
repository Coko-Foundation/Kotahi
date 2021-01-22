import PropTypes from 'prop-types'
import React from 'react'

const JournalContext = React.createContext()

const JournalProvider = ({ journal, children }) => (
  <JournalContext.Provider value={journal}>{children}</JournalContext.Provider>
)

JournalProvider.propTypes = {
  journal : PropTypes.node.isRequired,
  children : PropTypes.node.isRequired,
}

export { JournalContext, JournalProvider }
