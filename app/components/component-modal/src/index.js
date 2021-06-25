import React from 'react'
import ReactModal from 'react-modal'

const styles = {
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  content: {
    backgroundColor: '#303030',
    border: 'none',
    width: 'fit-content',
    height: 'fit-content',
    margin: '0 auto',
    padding: '0',
  },
}

const Modal = ({ children, ...props }) => {
  return (
    <ReactModal style={styles} {...props}>
      {children}
    </ReactModal>
  )
}

export default Modal
