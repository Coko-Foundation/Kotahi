import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { Button } from '@pubsweet/ui'
import { publishManuscriptMutation } from './queries'

import {
  Title,
  SectionHeader,
  SectionRowGrid,
  SectionActionInfo,
  SectionAction,
} from './style'

import { SectionContent } from '../../../shared'

const Publish = ({ manuscript }) => {
  // Hooks from the old world
  const [publishManuscript] = useMutation(publishManuscriptMutation)
  const [isPublishing, setIsPublishing] = useState(false)

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
        </SectionActionInfo>
        <SectionAction>
          <Button
            disabled={notAccepted || isPublishing}
            onClick={() => {
              setIsPublishing(true)
              publishManuscript({ variables: { id: manuscript.id } }).then(() =>
                setIsPublishing(false),
              )
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
