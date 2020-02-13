import React from 'react'
import styled from 'styled-components'

import { Attachment } from '@pubsweet/ui'

const Root = styled.div``

const Title = styled.div``

const Heading = styled.span`
  font-weight: inherit;
  padding: 0 1em 0 0;
  white-space: nowrap;
  text-align: right;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 50%;
`
const Metadata = styled.div`
  div {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
  }
`

const Cell = styled.span`
  padding: 0;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 50%;
`

const getNote = (notes, type) =>
  notes.find(note => note.notesType === type) || {}

const getDeclarations = (manuscript, field) =>
  ((manuscript.meta || {}).declarations || {})[field]

const getSupplementaryFiles = supplementary =>
  (supplementary || []).filter(file => file.fileType === 'supplementary') || []

// Due to migration to new Data Model
// Attachement component needs different data structure to work
// needs to change the pubsweet ui Attachement to support the new Data Model
const filesToAttachment = file => ({
  name: file.filename,
  url: file.url,
})

const ReviewMetadata = ({ manuscript }) => (
  <Root>
    <Title>Metadata</Title>
    <Metadata>
      <div>
        <Heading>Open Peer Review :</Heading>
        <Cell>
          {getDeclarations(manuscript, 'openPeerReview') === 'yes'
            ? 'Yes'
            : 'No'}
        </Cell>
      </div>
      <div>
        <Heading>Streamlined Review :</Heading>
        <Cell>
          {getDeclarations(manuscript, 'streamlinedReview') === 'yes'
            ? 'Please view supplementary uploaded files'
            : 'No'}
        </Cell>
      </div>
      <div>
        <Heading>Part of Research Nexus :</Heading>
        <Cell>
          {getDeclarations(manuscript, 'researchNexus') === 'yes'
            ? 'Yes'
            : 'No'}
        </Cell>
      </div>
      <div>
        <Heading>Pre-registered :</Heading>
        <Cell>
          {getDeclarations(manuscript, 'preregistered') === 'yes'
            ? 'Yes'
            : 'No'}
        </Cell>
      </div>
      <div>
        <Heading>Suggested Reviewers :</Heading>
        <Cell>
          {((manuscript.suggestions || {}).reviewers || {}).suggested || 'None'}
        </Cell>
      </div>
      <div>
        <Heading>Opposed Reviewers :</Heading>
        <Cell>
          {((manuscript.suggestions || {}).reviewers || {}).opposed || 'None'}
        </Cell>
      </div>
      <div>
        <Heading>Suggested Editors :</Heading>
        <Cell>
          {((manuscript.suggestions || {}).editors || {}).suggested || 'None'}
        </Cell>
      </div>
      <div>
        <Heading>Opposed Editors :</Heading>
        <Cell>
          {((manuscript.suggestions || {}).editors || {}).opposed || 'None'}
        </Cell>
      </div>
      <div>
        <Heading>Special Instructions :</Heading>
        <Cell>
          {getNote(manuscript.meta.notes || [], 'specialInstructions')
            .content || 'None'}
        </Cell>
      </div>
      {getSupplementaryFiles(manuscript.files).length > 0 && (
        <div>
          <Heading>
            {getSupplementaryFiles(manuscript.files).length} supplementary{' '}
            {getSupplementaryFiles(manuscript.files).length === 1
              ? 'file'
              : 'files'}
            :
          </Heading>
          {!!getSupplementaryFiles(manuscript.files).length && (
            <Cell>
              {getSupplementaryFiles(manuscript.files).map(file => (
                <Attachment
                  file={filesToAttachment(file)}
                  key={file.url}
                  uploaded
                />
              ))}
            </Cell>
          )}
        </div>
      )}
    </Metadata>
  </Root>
)

export default ReviewMetadata
