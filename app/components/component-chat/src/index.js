import React from 'react'
import styled from 'styled-components'
// import { th } from '@pubsweet/ui-toolkit'
// import { useQuery } from '@apollo/react-hooks'
// import gql from 'graphql-tag'
// import { useParams } from 'react-router-dom'
import Messages from './Messages/Messages'
import ChatInput from './SuperChatInput/SuperChatInput'

const MessageContainer = styled.section`
  display: grid;
  min-width: 100%;
  // flex-direction: column;
  background: rgb(255, 255, 255);
  // height: calc(100vh - 64px);
  // grid-template-rows: calc(100% - 40px);
  grid-template-areas:
    'read'
    'write';
`

// const GET_CHANNEL_BY_DOI = gql`
//   query findByDOI($doi: String) {
//     findByDOI(doi: $doi) {
//       id
//     }
//   }
// `

const Container = ({ channelId }) => {
  return (
    <MessageContainer>
      <Messages channelId={channelId} />
      <ChatInput channelId={channelId} />
    </MessageContainer>
  )
}

export default Container
