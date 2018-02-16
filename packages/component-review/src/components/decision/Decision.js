import React from 'react'
import styled from 'styled-components'

import { NoteViewer } from 'xpub-edit'
import { Attachment } from '@pubsweet/ui'

const Heading = styled.div``
const Note = styled.div``
const Content = styled.div``
const Recommendation = styled.div``

const Decision = ({ decision }) => (
  <div>
    <div>
      <Heading>Note</Heading>

      <Note>
        <Content>
          <NoteViewer value={decision.note.content} />
        </Content>

        {decision.note.attachments &&
          decision.note.attachments.map(attachment => (
            <Attachment key={attachment.url} value={attachment} />
          ))}
      </Note>
    </div>

    <div>
      <Heading>Decision</Heading>

      <Recommendation>{decision.recommendation}</Recommendation>
    </div>
  </div>
)

export default Decision
