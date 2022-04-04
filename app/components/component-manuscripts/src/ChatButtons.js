// TODO: Rename file to ShowChatButton correct all imports
import React from 'react'
import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import { Icon } from '@pubsweet/ui'
import lightenBy from '../../../shared/lightenBy'

const ShowChatFloatRightButton = styled.button`
  align-items: center;
  /* add a global style for this */
  background-color: ${th('colorPrimary')};
  border-radius: ${th('borderRadius')};
  color: ${th('colorTextReverse')};
  display: flex;
  float: right;
  font-size: 16px;
  margin: 0 0 0 ${grid(2)};
  padding: 4px 12px;

  &:hover {
    background-color: ${lightenBy('colorPrimary', 0.2)};
  }

  svg {
    margin-right: 0.1em;
    stroke: ${th('colorTextReverse')};
    width: 1em;
  }
`

const ShowChatButton = ({ onClick }) => {
  return (
    <ShowChatFloatRightButton onClick={onClick}>
      <Icon>message-square</Icon>
      Chat
    </ShowChatFloatRightButton>
  )
}

export default ShowChatButton
