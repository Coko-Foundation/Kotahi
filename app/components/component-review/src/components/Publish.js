import React from 'react'
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

  const notAccepted = manuscript.status !== 'accepted'

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
            disabled={manuscript.published || notAccepted}
            onClick={() =>
              publishManuscript({ variables: { id: manuscript.id } })
            }
            primary
          >
            Publish
          </Button>
        </SectionAction>
      </SectionRowGrid>
    </SectionContent>
  )
}

export default Publish
