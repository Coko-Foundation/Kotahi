import React from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'
import FullWaxEditor from '../../../wax-collab/src/FullWaxEditor'

import MessageContainer from '../../../component-chat/src/MessageContainer'
import { Spinner } from '../../../shared'

// const options = {
//   //  schema: new CreateSchema(XpubSchema),
// }

const Info = styled.span`
  align-items: center;
  display: flex;
  height: 500px;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;
`

const Columns = styled.div`
  display: grid;
  grid-template-areas: 'manuscript chat';
  grid-template-columns: 3fr 2fr;
  height: 100vh;
  justify-content: center;
  overflow: hidden;
`

const ManuscriptContainer = styled.div`
  grid-area: manuscript;
  overflow-y: scroll;

  .wax-container {
    height: 90%;
    top: 10%;
  }
`

const Chat = styled.div`
  border-left: 1px solid ${th('colorFurniture')};
  display: flex;
  grid-area: chat;
  height: 100vh;
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
        {content ? (
          <FullWaxEditor readonly user={currentUser} value={content} />
        ) : (
          <Spinner />
        )}
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
