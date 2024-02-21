import { createContext } from 'react'

export default createContext({
  modalKey: null,
  modals: {},
  showModal: props => () => {},
  hideModal: () => {},
})
