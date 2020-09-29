import React from 'react'
// // import styled from 'styled-components'
// // TODO: Sort out the imports, perhaps make DecisionReview a shared component?
// import Review from '../../../component-review/src/components/decision/DecisionReview'
// import { UserAvatar } from '../../../../components/component-avatar/src'
import { Button } from '@pubsweet/ui'
import { gql } from '@apollo/client'

import {
  SectionHeader,
  SectionRow,
  Title,
  SectionContent,
  HeadingWithAction,
} from '../../../shared'

const CreateANewVersion = ({
  manuscript,
  currentVersion,
  createNewVersion,
}) => (
  <SectionContent noGap>
    <SectionHeader>
      <Title>Create a new version</Title>
    </SectionHeader>
    <SectionRow>
      <HeadingWithAction>
        <p>
          You have been asked to <strong>revise</strong> your manuscript and the
          corresponding reviews and decision are available below. You can create
          a new version of your manuscript and resubmit it.
        </p>
        <Button
          onClick={() =>
            createNewVersion({
              variables: { id: manuscript.id },
              update: (cache, { data: { createNewVersion } }) => {
                // Always modify the main/original/parent manuscript
                const parentId = manuscript.parentId || manuscript.id
                cache.modify({
                  id: cache.identify({
                    id: parentId,
                    __typename: 'Manuscript',
                  }),
                  fields: {
                    manuscriptVersions(
                      existingVersionRefs = [],
                      { readField },
                    ) {
                      const newVersionRef = cache.writeFragment({
                        data: createNewVersion,
                        fragment: gql`
                          fragment NewManuscriptVersion on Manuscript {
                            id
                          }
                        `,
                      })

                      if (
                        existingVersionRefs.some(
                          ref => readField('id', ref) === createNewVersion.id,
                        )
                      ) {
                        return existingVersionRefs
                      }

                      return [newVersionRef, ...existingVersionRefs]
                    },
                  },
                })
              },
            })
          }
          primary
        >
          Create a new version
        </Button>
      </HeadingWithAction>
    </SectionRow>
  </SectionContent>
)

export default CreateANewVersion
