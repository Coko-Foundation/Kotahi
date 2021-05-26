import React from 'react'
import styled from 'styled-components'
import config from 'config'
import fnv from 'fnv-plus'
import { Icon } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import { darkenBy } from '../../../shared/lightenDarken'

const FloatRightButton = styled.a`
  align-items: center;
  background-color: ${darkenBy('colorSecondary', 0.2)};
  border-radius: ${th('borderRadius')};
  color: ${th('colorTextReverse')};
  display: flex;
  float: right;
  margin-left: 20px;
  padding: 2px 12px;

  svg {
    margin-right: 0.1em;
    stroke: ${th('colorTextReverse')};
    width: 1em;
  }
`

const VideoChatButton = () => {
  // Generate the chat room name by hashing the baseUrl, so it is unique to the instance.
  // TODO: Obtain hash from server, with a secret incorporated in it (to prevent outsiders from figuring out the room ID)
  const chatRoomId = fnv.hash(config['pubsweet-client'].baseUrl).hex()

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
