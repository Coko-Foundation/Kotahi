import React, { Fragment } from 'react'
import ModalContext from './ModalContext'

const withModal = props => {
  const { render } = props

  return (
    <ModalContext.Consumer>
      {({ hideModal, showModal, data = {}, modals, modalKey }) => {
        const ModalComponent = modals[modalKey]
        return (
          <Fragment>
            {modalKey && (
              <ModalComponent
                isOpen={modalKey !== undefined}
                data={data}
                hideModal={hideModal}
              />
            )}
            {render({ hideModal, showModal })}
          </Fragment>
        )
      }}
    </ModalContext.Consumer>
  )
}

export default withModal
