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

const Publish = ({ manuscript, publishManuscript }) => {
  // Hooks from the old world
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishResponse, setPublishResponse] = useState(null)
  const [publishingError, setPublishingError] = useState(null)

  const notAccepted = !['accepted', 'published'].includes(manuscript.status)

  return (
    <SectionContent>
      <SectionHeader>
        <Title>Publishing</Title>
      </SectionHeader>

      <SectionRowGrid>
        <SectionActionInfo>
          {manuscript.published &&
            `This submission was published on ${manuscript.published}`}
          {!manuscript.published &&
            notAccepted &&
            `You can only publish accepted submissions.`}
          {!manuscript.published &&
            !notAccepted &&
            `Publishing will add a new entry on the public website and can not be undone.`}
          {publishResponse &&
            publishResponse.steps.map(doi => {
              if (doi.succeeded === true) {
                return <Alert type="success">Posted to {doi.stepLabel}</Alert>
              }

              if (doi.succeeded === false) {
                return (
                  <Alert type="error">Error posting to {doi.stepLabel}</Alert>
                )
              }

              return null
            })}
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
