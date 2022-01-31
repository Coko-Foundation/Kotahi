import React from 'react'
import styled from 'styled-components'
import { Icon } from '@pubsweet/ui'
import { th, grid } from '@pubsweet/ui-toolkit'
import lightenBy from '../../../shared/lightenBy'

const FloatRightButton = styled.a`
  align-items: center;
  background-color: ${th('colorPrimary')};
  border-radius: ${th('borderRadius')};
  color: ${th('colorTextReverse')};
  display: flex;
  float: right;
  margin: 0 0 ${grid(1)} ${grid(2)};
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

const VideoChatButton = ({ chatRoomId }) => {
  // Generate the chat room name by hashing the baseUrl, so it is unique to the instance.
  // TODO: Obtain hash from server, with a secret incorporated in it (to prevent outsiders from figuring out the room ID)

  return (
    <FloatRightButton
      href={`https://8x8.vc/coko/${chatRoomId}`}
      target={chatRoomId}
    >
      <Icon>video</Icon>
      Video chat
    </FloatRightButton>
  )
}

export default VideoChatButton
