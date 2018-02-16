import React from 'react'
import styled from 'styled-components'
import { NoteViewer } from 'xpub-edit'
import { Attachment } from '@pubsweet/ui'

const Heading = styled.div``
const Note = styled.div`
  font-size: var(--font-size-base-small);
`
const Recommendation = Note.extend``
const Content = styled.div``

const Review = ({ review }) => (
  <div>
    <div>
      <Heading>Note</Heading>

      <Note>
        <Content>
          <NoteViewer value={review.note.content} />
        </Content>

        {review.note.attachments &&
          review.note.attachments.map(attachment => (
            <Attachment key={attachment.url} value={attachment} />
          ))}
      </Note>
    </div>

    {review.confidential && (
      <div>
        <Heading>Confidential</Heading>

        <Note>
          <Content>
            <NoteViewer value={review.confidential.content} />
          </Content>

          {review.confidential.attachments &&
            review.confidential.attachments.map(attachment => (
              <Attachment key={attachment.url} value={attachment} />
            ))}
        </Note>
      </div>
    )}

    <div>
      <Heading>Recommendation</Heading>

      <Recommendation>{review.Recommendation.recommendation}</Recommendation>
    </div>
  </div>
)

export default Review
