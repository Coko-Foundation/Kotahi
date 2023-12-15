import React from 'react'
import styled from 'styled-components'
import theme, { color } from '../../theme'

const StyledInput = styled.input`
  background: ${color.gray99};
  border: 1px solid ${color.gray80};
  border-radius: ${theme.borderRadius};
  box-shadow: inset 0px 0px 4px rgba(0, 0, 0, 0.07);
  font-size: ${theme.fontSizeBaseSmall};
  padding: 14px 9px;
  width: 100%;

  &:hover {
    border: 1px solid ${color.gray70};
    outline: none;
    transition: ${theme.transitionDuration};
  }

  &:active,
  &:focus-visible {
    border: 1px solid ${color.brand1.base};
    outline: none;
    transition: ${theme.transitionDuration};
  }
`

// eslint-disable-next-line import/prefer-default-export
export const TextInput = props => {
  const { readonly, value } = props
  return readonly ? <div>{value}</div> : <StyledInput type="text" {...props} />
}
