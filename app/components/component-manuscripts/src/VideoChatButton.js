import React from 'react'
import styled from 'styled-components'
import { Icon } from '@pubsweet/ui'
import { th, grid } from '@pubsweet/ui-toolkit'
import { color } from '../../../theme'

const FloatRightButton = styled.a`
  align-items: center;
  background-color: ${color.brand1.base};
  border-radius: 27px;
  color: ${color.textReverse};
  display: flex;
  float: right;
  left: 92%;
  margin: ${grid(1)} ${grid(1)} ${grid(1)} ${grid(2)};
  padding: 8px 12px;
  position: absolute;
  top: 10%;
  z-index: 1000;

  &:hover {
    background-color: ${color.brand1.tint25};
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
    </FloatRightButton>
  )
}

export default VideoChatButton
