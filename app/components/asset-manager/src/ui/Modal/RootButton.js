import styled, { css } from 'styled-components'

import { th, grid } from '@pubsweet/ui-toolkit'

const activeStyles = css`
  color: ${({ danger }) => (danger ? th('colorError') : th('colorPrimary'))};

  > i svg {
    fill: ${({ danger }) => (danger ? th('colorError') : th('colorPrimary'))};
  }
`

const disabledStyles = css`
  cursor: not-allowed;
  opacity: 0.4;

  &:hover {
    background: none;
  }
`

const RootButton = styled.button.attrs(({ title, type }) => ({
  title,
  type: type || 'button',
}))`
  align-items: center;
  background: none;
  border: none;
  color: ${th('colorText')};
  cursor: pointer;
  display: flex;
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBase')};
  justify-content: center;
  outline: none;
  padding: ${grid(0.5)};
  transition: all 0.1s ease-in;

  > i svg {
    fill: ${th('colorText')};
    transition: all 0.1s ease-in;
  }

  &:hover {
    background: ${th('colorBackgroundHue')};
    color: ${({ danger }) => (danger ? th('colorError') : th('colorPrimary'))};

    > i svg {
      fill: ${({ danger }) => (danger ? th('colorError') : th('colorPrimary'))};
      transition: all 0.1s ease-in;
    }
  }

  /* stylelint-disable */
  ${props => props.active && activeStyles}
  ${props => props.disabled && disabledStyles}
`

export default RootButton
