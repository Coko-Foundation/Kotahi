import React from 'react'
import styled from 'styled-components'
import { Icon } from '@pubsweet/ui'
import { th, grid } from '@pubsweet/ui-toolkit'
import lightenBy from '../../../../shared/lightenBy'

const Button = styled.a`
  align-items: center;
  /* background-color: ${th('colorPrimary')}; */
  background-color: ${props =>
    props.isTopBarOpen ? th('colorPrimary') : th('colorTextReverse')};
  border: 1px solid #8e8e8e;
  border-radius: 10px;
  height: fit-content;
  margin: ${grid(1)} ${grid(1)} 0 0;
  padding: 4px 0;

  &:hover {
    background-color: ${props =>
      props.isTopBarOpen
        ? lightenBy('colorPrimary', 0.2)
        : lightenBy('colorTextReverse', 0.2)};
  }

  svg {
    stroke: ${props =>
      props.isTopBarOpen ? th('colorTextReverse') : th('colorText')};
    width: 0.8em;
  }
`

const ToolbarButton = ({ onClick, isTopBarOpen }) => {
  return (
    <Button
      isTopBarOpen={isTopBarOpen}
      onClick={onClick}
      title={isTopBarOpen ? 'Hide formatting' : 'Formatting'}
    >
      {isTopBarOpen ? <Icon>chevron-down</Icon> : <Icon>chevron-up</Icon>}
    </Button>
  )
}

export default ToolbarButton
