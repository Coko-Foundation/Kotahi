import React from 'react'
import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'

const BareButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${th('colorTextPlaceholder')};
  display: flex;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  justify-content: center;
  line-height: inherit;
  min-height: ${grid(3)};
  min-width: ${grid(3)};
  padding: 0 ${grid(0.5)};

  &:hover {
    color: ${th('colorPrimary')};
  }

  & svg {
    stroke: ${th('colorTextPlaceholder')};
  }

  &:hover svg {
    stroke: ${th('colorPrimary')};
  }
`

const MinimalButton = ({ children, type, ...rest }) => (
  <BareButton type={type || 'button'} {...rest}>
    {children}
  </BareButton>
)

export default MinimalButton
