import React from 'react'
import { State } from 'react-powerplug'

import ModalContext from './ModalContext'

function ModalProvider({ children, modals: modalsVal }) {
  return (
    <State
      initial={{
        modalState: { data: undefined, modalKey: undefined },
        modals: modalsVal,
      }}
    >
      {({ state, setState }) => {
        const { modalState, modals } = state

        const hideModal = () => {
          setState({
            modalState: {
              data: undefined,
              modalKey: undefined,
            },
          })
        }

        const showModal = (modalKey, data) => {
          setState({
            modalState: {
              data,
              modalKey,
            },
          })
        }

        return (
          <ModalContext.Provider
            value={{
              ...modalState,
              modals,
              showModal,
              hideModal,
            }}
          >
            {children}
          </ModalContext.Provider>
        )
      }}
    </State>
  )
}

export default ModalProvider
