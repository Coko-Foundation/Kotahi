/* eslint-disable react/destructuring-assignment */
import React from 'react'

const JournalContext = React.createContext()

const JournalProvider = props => (
  // eslint-disable-next-line react/prop-types
  <JournalContext.Provider value={props.journal}>
    {props.children}
  </JournalContext.Provider>
)

export { JournalContext, JournalProvider }
