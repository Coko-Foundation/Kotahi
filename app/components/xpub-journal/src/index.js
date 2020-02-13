import React from 'react'

const JournalContext = React.createContext()

const JournalProvider = props => (
  <JournalContext.Provider value={props.journal}>
    {props.children}
  </JournalContext.Provider>
)

export { JournalContext, JournalProvider }
