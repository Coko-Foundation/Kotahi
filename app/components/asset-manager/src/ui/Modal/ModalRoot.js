/* eslint-disable react/prop-types */

import React from 'react'
import ReactModal from 'react-modal'
import styled, { css } from 'styled-components'

import { th, grid } from '@pubsweet/ui-toolkit'

import Body from './ModalBody'

ReactModal.setAppElement('#root')

/*
  This is to make react modal and styled components play nice
  See https://github.com/styled-components/styled-components/issues/1494#issuecomment-363362709
*/
function ReactModalAdapter({ className, modalClassName, ...props }) {
  return (
    <ReactModal
      className={modalClassName}
      closeTimeoutMS={150}
      portalClassName={className}
      {...props}
    />
  )
}

const large = css`
  width: calc(1144px - 16px);
  height: calc(640px - 16px);
  margin: ${grid(5)} auto;
`

const largeNarrow = css`
  width: calc(1000px - 16px);
  height: calc(640px - 16px);
  margin: ${grid(5)} auto;
`

const medium = css`
  height: calc(536px - 16px);
  width: calc(936px - 16px);
  margin: ${grid(7)} auto;
`

const mediumNarrow = css`
  height: calc(536px - 16px);
  width: calc(752px - 16px);
  margin: ${grid(7)} auto;
`

const small = css`
  height: calc(248px - 16px);
  width: calc(496px - 16px);
  margin: ${grid(8)} auto;
`

const StyledModal = styled(ReactModalAdapter).attrs({
  modalClassName: 'Modal',
  overlayClassName: 'Overlay',
})`
  .Overlay {
    background-color: rgba(240, 240, 240, 0.85);
    bottom: 0;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
  }

  .Modal {
    background: ${th('colorBackground')};
    border: ${th('borderWidth')} ${th('borderStyle')} ${th('colorBorder')};
    padding: ${grid(1)};
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    outline: none;
    overflow: hidden;
    padding: ${grid(1)};

    /* stylelint-disable order/properties-alphabetical-order */
    ${props => (props.size === 'large' ? large : '')}
    ${props => (props.size === 'largeNarrow' ? largeNarrow : '')}
    ${props => (props.size === 'small' ? small : '')}
    ${props => (props.size === 'medium' ? medium : '')}
    ${props => (props.size === 'medium_narrow' ? mediumNarrow : '')}
    /* stylelint-enable order/properties-alphabetical-order */
  }

  .ReactModal__Overlay {
    opacity: 0;
    transition: opacity 150ms ease-in-out;
  }

  .ReactModal__Overlay--after-open {
    opacity: 1;
    z-index: 100000;
  }

  .ReactModal__Overlay--before-close {
    opacity: 0;
  }
`

const ModalRoot = props => {
  const {
    children,
    className,
    footerComponent = null,
    headerComponent = null,
    onRequestClose,
    ...rest
  } = props

  if (!props.isOpen) return null
  return (
    <StyledModal
      className={className}
      onRequestClose={onRequestClose}
      {...rest}
    >
      {headerComponent &&
        React.cloneElement(headerComponent, {
          onRequestClose,
          ...rest,
        })}

      <Body>{children}</Body>

      {footerComponent &&
        React.cloneElement(footerComponent, {
          onRequestClose,
          ...rest,
        })}
    </StyledModal>
  )
}

export default ModalRoot
