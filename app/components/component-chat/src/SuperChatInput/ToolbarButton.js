import React from 'react'
import styled from 'styled-components'
import { Icon } from '@pubsweet/ui'
import { grid } from '@pubsweet/ui-toolkit'
import { color } from '../../../../theme'

const Button = styled.a`
  align-items: center;
  /* background-color: ${color.brand1.base}; */
  background-color: ${props =>
    props.isTopBarOpen ? color.brand1.base : color.textReverse};
  border: 1px solid ${color.gray50};
  border-radius: 10px;
  height: fit-content;
  margin: ${grid(1)} ${grid(1)} 0 0;
  padding: 4px 0;

  &:hover {
    background-color: ${props =>
      props.isTopBarOpen ? color.brand1.tint25 : color.gray80};
  }

  svg {
    stroke: ${props => (props.isTopBarOpen ? color.textReverse : color.text)};
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
