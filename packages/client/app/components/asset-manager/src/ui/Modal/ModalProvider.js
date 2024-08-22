import React, { useState } from 'react'

import ModalContext from './ModalContext'

const ModalProvider = ({ children, modals }) => {
  const [modalState, setModalState] = useState({
    data: undefined,
    modalKey: undefined,
  })

  const hideModal = () => {
    setModalState({ data: undefined, modalKey: undefined })
  }

  const showModal = (modalKey, data) => {
    setModalState({ data, modalKey })
  }

  return (
    <ModalContext.Provider
      /* eslint-disable-next-line react/jsx-no-constructed-context-values */
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
}

export default ModalProvider
