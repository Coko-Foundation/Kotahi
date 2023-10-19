import React, { useContext } from 'react'
import styled from 'styled-components'
import fnv from 'fnv-plus'
import { grid } from '@pubsweet/ui-toolkit'
import { useTranslation } from 'react-i18next'
import { RoundIconButton } from '../../shared'
import { ConfigContext } from '../../config/src'

const FloatRightButton = styled(RoundIconButton)`
  margin: ${grid(1)} ${grid(1)} ${grid(1)} ${grid(2)};
  position: absolute;
  right: 42px;
  z-index: 1000;
`

const openInNewTab = (url, target = '_blank') => {
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
  if (newWindow) newWindow.opener = null
}

const VideoChat = ({ manuscriptId }) => {
  // Generate the chat room name by hashing the baseUrl, so it is unique to the instance.
  // TODO: Obtain hash from server, with a secret incorporated in it (to prevent outsiders from figuring out the room ID)
  const chatRoomId = fnv.hash(manuscriptId).hex()
  const config = useContext(ConfigContext)
  const { t } = useTranslation()

  return (
    <FloatRightButton
      iconName="Video"
      onClick={() =>
        openInNewTab(
          `https://8x8.vc${config.urlFrag}/${chatRoomId}`,
          chatRoomId,
        )
      }
      primary
      title={t('chat.Open video chat')}
    />
  )
}

export default VideoChat
