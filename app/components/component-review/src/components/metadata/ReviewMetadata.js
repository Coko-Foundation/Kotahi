import PropTypes from 'prop-types'
import React from 'react'
import config from 'config'
import styled from 'styled-components'
import { get } from 'lodash'
import { Attachment } from '@pubsweet/ui'
import SimpleWaxEditor from '../../../../wax-collab/src/SimpleWaxEditor'
import { Title, SectionHeader, SectionRowGrid } from '../style'
import { SectionContent } from '../../../../shared'

const Heading = styled.span`
  font-weight: inherit;
  overflow: hidden;
  padding: 0 1em 0 0;
  text-overflow: ellipsis;
  white-space: nowrap;
`

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

const showFieldData = (manuscript, fieldName, form) => {
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

  const fieldDefinition = form.children?.find(field => field.name === fieldName)
  if (data && fieldDefinition?.component === 'AbstractEditor')
    return <SimpleWaxEditor readonly value={data} />

  return data
}

const shouldShowInPreview = (fieldName, form) => {
  const fieldDefinition = form.children?.find(field => field.name === fieldName)
  return fieldDefinition.includeInReviewerPreview
}

// Due to migration to new Data Model
// Attachement component needs different data structure to work
// needs to change the pubsweet ui Attachement to support the new Data Model
const filesToAttachment = file => ({
  name: file.filename,
  url: file.url,
})

const ReviewMetadata = ({
  form,
  manuscript: rawManuscript,
  showPreviewMetadataOnly,
}) => {
  // Parse submission metadata JSON for display purposes
  const manuscript = {
    ...rawManuscript,
    submission: JSON.parse(rawManuscript.submission),
  }

  return (
    <SectionContent>
      {!showPreviewMetadataOnly && (
        <SectionHeader>
          <Title>Metadata</Title>
        </SectionHeader>
      )}

      {config['client-features'].displayShortIdAsIdentifier &&
        config['client-features'].displayShortIdAsIdentifier.toLowerCase() ===
          'true' && (
          <SectionRowGrid>
            <Heading>Manuscript Number</Heading>
            <Cell>{rawManuscript.shortId}</Cell>
          </SectionRowGrid>
        )}

      {form.children.map(element =>
        !showPreviewMetadataOnly || shouldShowInPreview(element.name, form) ? (
          <SectionRowGrid key={element.id}>
            <Heading>{element.shortDescription || element.title}</Heading>
            <Cell>{showFieldData(manuscript, element.name, form)}</Cell>
          </SectionRowGrid>
        ) : null,
      )}
      {!showPreviewMetadataOnly && (
        <>
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
        </>
      )}
    </SectionContent>
  )
}

ReviewMetadata.propTypes = {
  form: PropTypes.shape({
    children: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        component: PropTypes.string,
        title: PropTypes.string,
        shortDescription: PropTypes.string,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  manuscript: PropTypes.shape({
    meta: PropTypes.shape({
      notes: PropTypes.arrayOf(
        PropTypes.shape({
          notesType: PropTypes.string.isRequired,
          content: PropTypes.string.isRequired,
        }).isRequired,
      ),
    }).isRequired,
    files: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired,
        filename: PropTypes.string.isRequired,
      }).isRequired,
    ),
  }).isRequired,
  showPreviewMetadataOnly: PropTypes.bool,
}

ReviewMetadata.defaultProps = {
  showPreviewMetadataOnly: false,
}

export default ReviewMetadata
