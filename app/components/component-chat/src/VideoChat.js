import React from 'react'
import styled from 'styled-components'
import fnv from 'fnv-plus'
import { Icon } from '@pubsweet/ui'
import { th, grid } from '@pubsweet/ui-toolkit'
import lightenBy from '../../../shared/lightenBy'

const FloatRightButton = styled.a`
  align-items: center;
  background-color: ${th('colorPrimary')};
  border-radius: 27px;
  color: ${th('colorTextReverse')};
  display: flex;
  float: right;
  margin: ${grid(1)} ${grid(1)} ${grid(1)} ${grid(2)};
  padding: 8px 12px;
  position: absolute;
  z-index: 1000;
  left: 80%;

  &:hover {
    background-color: ${lightenBy('colorPrimary', 0.2)};
  }

  svg {
    margin-right: 0.1em;
    stroke: ${th('colorTextReverse')};
    width: 1em;
  }
`

const VideoChat = ({ manuscriptId }) => {
  // Generate the chat room name by hashing the baseUrl, so it is unique to the instance.
  // TODO: Obtain hash from server, with a secret incorporated in it (to prevent outsiders from figuring out the room ID)
  const chatRoomId = fnv.hash(manuscriptId).hex()

  return (
    <FloatRightButton
      href={`https://8x8.vc/coko/${chatRoomId}`}
      target={chatRoomId}
    >
      <Icon>video</Icon>
    </FloatRightButton>
  )
}

export default VideoChat
