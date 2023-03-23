import React from 'react'
import ReactModal from 'react-modal'
import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { Button } from '@pubsweet/ui'
import { Icon, ActionButton } from '../../shared'

const styles = {
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    overflow: 'hidden',
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '4px',
    maxWidth: '60%',
    maxHeight: '80%',
    margin: '0px',
    padding: '0px',
    inset: 'unset',
  },
}

const MainHeader = styled.div`
  align-items: center;
  border-bottom-width: 1.5px;
  border-color: #d3d3d3;
  border-style: solid;
  display: flex;
  justify-content: space-between;
  line-height: 22px;
  padding: ${grid(2)} ${grid(3)};
  z-index: 10000;
`

const RowHeaderContainer = styled.div`
  align-items: center;
  display: flex;
  font-family: ${th('fontHeading')};
  gap: 16px;
`

const StackedHeaderContainer = styled.div`
  align-items: flex-start;
  column-gap: 180px;
  display: flex;
  flex-direction: column;
  font-family: ${th('fontHeading')};
  font-weight: 600;
`

export const Title = styled.div`
  font-size: ${th('fontSizeHeading5')};
  font-weight: 500;
`

export const Subtitle = styled.div`
  color: grey;
  font-size: ${th('fontSizeHeading6')};
  font-weight: normal;
`

const CloseButton = styled(Button)`
  align-items: center;
  background-color: #ffffff;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  height: 30px;
  justify-content: center;
  min-width: unset;
  width: 30px;

  &:hover {
    background-color: #d7efd4;

    svg {
      stroke: white;
    }
  }
`

const ButtonPanel = styled.div`
  align-items: center;
  background-color: #f9fafb;
  border-top: 1px solid rgba(34, 36, 38, 0.15);
  display: flex;
  flex-direction: row;
  font-size: 15px;
  justify-content: space-between;
  padding: ${grid(1.5)} ${grid(3)};
  width: 100%;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: ${grid(2)};
`

const PrimaryActionButton = styled(ActionButton)`
  background-color: ${th('colorPrimary')};
  border-radius: 6px;
  color: white;
  cursor: pointer;
  margin: 0px 5px;
`

const SecondaryActionButton = styled(ActionButton)`
  background-color: white;
  border: 1px solid black;
  border-radius: 6px;
  color: grey;
  cursor: pointer;
`

const CheckBoxContainer = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  margin: 10px 5px;
`

const ModalContainer = styled.div`
  background-color: ${th('colorBackground')};
  border-radius: 0;
  margin: 0;
  max-height: calc(80vh - 10em);
  overflow-y: auto;
  padding: ${grid(2.5)} ${grid(3)};
  width: 100%;
  z-index: 10000;
`

export const PrimaryButton = ({ onClick, children }) => {
  return <PrimaryActionButton onClick={onClick}>{children}</PrimaryActionButton>
}

export const SecondaryButton = ({ onClick, children }) => {
  return (
    <SecondaryActionButton onClick={onClick}>{children}</SecondaryActionButton>
  )
}

export const CheckBoxButton = ({ onClick, isClicked, children }) => {
  return (
    <CheckBoxContainer onClick={onClick}>
      {(isClicked && <Icon>check-square</Icon>) || <Icon>square</Icon>}
      {children}
    </CheckBoxContainer>
  )
}

export const StackedHeader = ({
  title,
  subtitle, // optional
  textStyles,
}) => {
  return (
    <StackedHeaderContainer>
      <Title style={textStyles}>{title}</Title>
      {subtitle && <Subtitle style={textStyles}>{subtitle}</Subtitle>}
    </StackedHeaderContainer>
  )
}

export const RowHeader = ({
  title,
  subtitle, // optional
}) => {
  return (
    <RowHeaderContainer>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </RowHeaderContainer>
  )
}

const Modal = ({
  isOpen, // bool used to open and close modal
  onClose, // function to close your modal / set isOpen=false
  leftActions,
  rightActions,
  title, // main title in black
  subtitle, // optional subtitle in grey
  children,
  overlayStyles,
  contentStyles,
  ...props
}) => {
  return (
    isOpen && (
      <ReactModal
        isOpen={isOpen}
        onRequestClose={onClose}
        style={{
          overlay: { ...styles.overlay, ...overlayStyles },
          content: { ...styles.content, ...contentStyles },
        }}
        {...props}
      >
        {title && (
          <MainHeader>
            <RowHeader subtitle={subtitle} title={title} />
            <CloseButton alignSelf="flex-end" onClick={onClose}>
              <Icon>x</Icon>
            </CloseButton>
          </MainHeader>
        )}

        <ModalContainer>{children}</ModalContainer>

        {(leftActions || rightActions) && (
          <ButtonPanel>
            <ButtonContainer>{leftActions}</ButtonContainer>
            <ButtonContainer>{rightActions}</ButtonContainer>
          </ButtonPanel>
        )}
      </ReactModal>
    )
  )
}

export default Modal
