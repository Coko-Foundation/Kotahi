/* eslint-disable react/prop-types */

import React from 'react'
import styled, { css } from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'
import Messages from './Messages/Messages'
import ChatInput from './SuperChatInput/SuperChatInput'
import { Tabs } from '../../shared'

const MessageContainer = styled.section`
  background: rgb(255, 255, 255);
  display: grid;
  min-width: 100%;

  ${props =>
    props.channels
      ? css`
          grid-template-rows: ${grid(5)} 1fr calc(${th('gridUnit')} * 8);
        `
      : css`
          grid-template-rows: 1fr calc(${th('gridUnit')} * 8);
        `}

  ${props =>
    props.channels
      ? css`
          grid-template-areas:
            'channels'
            'read'
            'write';
        `
      : css`
          grid-template-areas:
            'read'
            'write';
        `}
`

const Container = ({ channelId, channels }) => {
  if (!channelId && !channels) {
    return null
  }

  const tabs =
    channels &&
    channels.map(channel => ({
      label: channel.name,
      key: channel.id,
      content: (
        <>
          <Messages channelId={channel.id} />
          <ChatInput channelId={channel.id} />
        </>
      ),
    }))

  return (
    <MessageContainer channels={channels}>
      {tabs ? (
        <Tabs
          background="colorBackgroundHue"
          defaultActiveKey={tabs[0].key}
          sections={tabs}
        />
      ) : (
        <>
          {' '}
          <Messages channelId={channelId} />
          <ChatInput channelId={channelId} />
        </>
      )}
    </MessageContainer>
  )
}

export default Container
