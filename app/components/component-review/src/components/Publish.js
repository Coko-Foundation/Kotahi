import React, { useState } from 'react'
import { Button } from '@pubsweet/ui'

import {
  Title,
  SectionHeader,
  SectionRowGrid,
  SectionActionInfo,
  SectionAction,
} from './style'

import { SectionContent } from '../../../shared'
import Alert from './publishing/Alert'
import PublishingResponse from './publishing/PublishingResponse'

const Publish = ({ manuscript, publishManuscript, dois }) => {
  // Hooks from the old world
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishResponse, setPublishResponse] = useState(null)
  const [publishingError, setPublishingError] = useState(null)

  const notAccepted = !['accepted', 'published'].includes(manuscript.status)

  const doiMessage =
    dois !== null &&
    (dois.length > 0 ? (
      <p>DOIs to be registered: {dois.join(', ')}</p>
    ) : (
      <p>No DOIs will be registered at time of publishing.</p>
    ))

  return (
    <SectionContent>
      <SectionHeader>
        <Title>Publishing</Title>
      </SectionHeader>

      <SectionRowGrid>
        <SectionActionInfo>
          {manuscript.published &&
            `This submission was published on ${manuscript.published}`}
          {!manuscript.published && notAccepted && (
            <div>
              <p>You can only publish accepted submissions.</p>
              {doiMessage}
            </div>
          )}
          {!manuscript.published && !notAccepted && (
            <div>
              <p>
                Publishing will add a new entry on the public website and can
                not be undone.
              </p>
              {doiMessage}
            </div>
          )}
          {publishResponse && <PublishingResponse response={publishResponse} />}
          {publishingError && <Alert type="error">{publishingError}</Alert>}
        </SectionActionInfo>
        <SectionAction>
          <Button
            disabled={notAccepted || isPublishing}
            onClick={() => {
              setIsPublishing(true)

              publishManuscript({ variables: { id: manuscript.id } })
                .then((res, error) => {
                  setIsPublishing(false)
                  setPublishResponse(res.data.publishManuscript, error)
                })
                .catch(error => {
                  console.error(error)
                  setIsPublishing(false)
                  setPublishingError(error.message)
                })
            }}
            primary
          >
            {manuscript.published ? 'Republish' : 'Publish'}
          </Button>
        </SectionAction>
      </SectionRowGrid>
    </SectionContent>
  )
}

export default Publish
