import React from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import { Wax /*, CreateSchema */ } from 'wax-prosemirror-core'
// import { XpubSchema } from 'wax-prosemirror-schema'
// import 'wax-prosemirror-themes/themes/default-theme.css'

import MessageContainer from '../../../component-chat/src'

const options = {
  //  schema: new CreateSchema(XpubSchema),
}

const Info = styled.span`
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 500px;
`

const Columns = styled.div`
  display: grid;
  // grid-column-gap: 2em;
  grid-template-areas: 'manuscript chat';
  grid-template-columns: 3fr 2fr;
  justify-content: center;
  overflow: hidden;
  height: 100vh;
`

const ManuscriptContainer = styled.div`
  grid-area: manuscript;
  overflow-y: scroll;
  .wax-container {
    top: 10%;
    height: 90%;
  }
`

const Chat = styled.div`
  border-left: 1px solid black;
  grid-area: chat;
  height: 100vh;
  // overflow-y: scroll;
  display: flex;
`

const Manuscript = ({
  file,
  content,
  currentUser,
  // fileUpload,
  history,
  // updateManuscript,
  channel,
}) => (
  <Columns>
    {file &&
    file.mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
      <ManuscriptContainer>
        <Wax
          key={1}
          options={options}
          theme="default"
          // fileUpload={fileUpload}
          // onChange={source => updateManuscript({ source })}
          value={content}
        />
      </ManuscriptContainer>
    ) : (
      <Info>No supported view of the file</Info>
    )}
    <Chat>
      <MessageContainer channelId={channel.id} />
    </Chat>
  </Columns>
)

export default withRouter(Manuscript)
