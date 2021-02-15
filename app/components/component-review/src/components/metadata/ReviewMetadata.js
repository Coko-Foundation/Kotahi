import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import { get } from 'lodash'
import { Attachment } from '@pubsweet/ui'
// import { grid } from '@pubsweet/ui-toolkit'

import form from '../../../../../storage/forms/submit.json'

import { Title, SectionHeader, SectionRowGrid } from '../style'
import { SectionContent } from '../../../../shared'

const Heading = styled.span`
  font-weight: inherit;
  overflow: hidden;
  padding: 0 1em 0 0;
  text-overflow: ellipsis;
  white-space: nowrap;
`

// const MetadataRow = styled.div`
//   padding: ${grid(2)} ${grid(3)};
// `

// const Metadata = styled.div`
//   div {
//     display: flex;
//     flex-direction: row;
//     // justify-content: flex-start;
//   }
// `

const Cell = styled.span`
  grid-column: span 2 / span 2;
  padding: 0;
`

const getNote = (notes, type) =>
  notes.find(note => note.notesType === type) || {}

// const getDeclarations = (manuscript, field) =>
//   ((manuscript.meta || {}).declarations || {})[field]

const getSupplementaryFiles = supplementary =>
  (supplementary || []).filter(file => file.fileType === 'supplementary') || []

const showFieldData = (manuscript, fieldName) => {
  const data = get(manuscript, fieldName)

  // TODO: Make this generic somehow. Perhaps with an additional fieldType?
  if (Array.isArray(data) && fieldName === 'submission.links') {
    return data.map(link => (
      <p key={link.url}>
        <a href={link.url} rel="noopener noreferrer" target="_blank">
          {link.url}
        </a>
      </p>
    ))
  }

  if (Array.isArray(data)) {
    return data.join(', ')
  }

  return data
}

// Due to migration to new Data Model
// Attachement component needs different data structure to work
// needs to change the pubsweet ui Attachement to support the new Data Model
const filesToAttachment = file => ({
  name: file.filename,
  url: file.url,
})

const ReviewMetadata = ({ manuscript: rawManuscript }) => {
  // Parse submission metadata JSON for display purposes
  const manuscript = {
    ...rawManuscript,
    submission: JSON.parse(rawManuscript.submission),
  }

  const sortedFormElements = form.children.sort((a, b) =>
    parseInt(a.order || '0', 10) > parseInt(b.order || '0', 10) ? 1 : -1,
  )

  return (
    <SectionContent>
      <SectionHeader>
        <Title>Metadata</Title>
      </SectionHeader>

      {sortedFormElements.map(element => (
        <SectionRowGrid key={element.id}>
          <Heading>{element.shortDescription || element.title}</Heading>
          <Cell>{showFieldData(manuscript, element.name)}</Cell>
        </SectionRowGrid>
      ))}
      <SectionRowGrid>
        <Heading>Special Instructions</Heading>
        <Cell>
          {getNote(manuscript.meta.notes || [], 'specialInstructions')
            .content || 'None'}
        </Cell>
      </SectionRowGrid>
      {getSupplementaryFiles(manuscript.files).length > 0 && (
        <SectionRowGrid>
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
        </SectionRowGrid>
      )}
    </SectionContent>
  )
}

ReviewMetadata.propTypes = {
  manuscript: PropTypes.node.isRequired,
}

export default ReviewMetadata
