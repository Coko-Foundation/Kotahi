import React, { useState } from 'react'

const XpubContext = React.createContext([{ converting: false }, () => {}])

const XpubProvider = props => {
  const [state, setState] = useState({ converting: false })
  return (
    <XpubContext.Provider value={[state, setState]}>
      {props.children}
    </XpubContext.Provider>
  )
}
export { XpubContext, XpubProvider }
