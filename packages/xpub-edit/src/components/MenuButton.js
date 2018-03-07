import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui'

const Button = styled.button`
  background: ${th('colorBackground')};
  border: none;
  border-bottom: 2px solid transparent;
  color: #777;
  cursor: pointer;
  height: 20px;
  margin: 0 0.4em;
  min-width: 20px;
  padding: 0;

  &:hover {
    border-bottom-color: ${th('colorPrimary')};
    color: ${th('colorPrimary')};
  }

  border-bottom-color: ${({ active }) => active && 'black'};
`

const MenuButton = ({ item, state, handle }) => (
  <Button
    active={item.active && item.active(state)}
    disabled={item.enable && !item.enable(state)}
    onMouseDown={handle}
    title={item.title}
  >
    {item.content}
  </Button>
)

export default MenuButton
