import React, { useState } from 'react'
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
  createNewVersion,
  allowAuthorsSubmitNewVersion,
}) => {
  const [newVerButtonIsEnabled, setNewVerButtonIsEnabled] = useState(true)

  return (
    <SectionContent>
      <SectionHeader>
        <Title>Submit a new version</Title>
      </SectionHeader>
      <SectionRow>
        <HeadingWithAction>
          {allowAuthorsSubmitNewVersion ? (
            <p>You can modify and resubmit a new version of your manuscript.</p>
          ) : (
            <p>
              You have been asked to <strong>revise</strong> your manuscript;
              see the reviews and decision below. You may modify and resubmit a
              new version of your manuscript.
            </p>
          )}
          <Button
            data-testid="create-new-manuscript-version-button"
            disabled={!newVerButtonIsEnabled}
            onClick={() => {
              setNewVerButtonIsEnabled(false) // Prevents double-clicking

              createNewVersion({
                variables: { id: manuscript.id },
                // eslint-disable-next-line no-shadow
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
            }}
            primary
          >
            Submit a new version...
          </Button>
        </HeadingWithAction>
      </SectionRow>
    </SectionContent>
  )
}

export default CreateANewVersion
