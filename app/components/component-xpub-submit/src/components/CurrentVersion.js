import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Attachment } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import Metadata from './MetadataFields'
import Declarations from './Declarations'
import Suggestions from './Suggestions'
import SupplementaryFiles from './SupplementaryFiles'

import { Heading1, Section, Legend } from '../styles'

const Wrapper = styled.div`
  font-family: ${th('fontInterface')};
  line-height: 1.3;
  margin: auto;
  max-width: 60em;

  overflow: ${({ confirming }) => confirming && 'hidden'};
`

const Intro = styled.div`
  font-style: italic;
  line-height: 1.4;
`

const filterFileManuscript = files =>
  files.filter(
    file =>
      file.type === 'manuscript' &&
      file.mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  )

// Due to migration to new Data Model
// Attachement component needs different data structure to work
// needs to change the pubsweet ui Attachement to support the new Data Model
const filesToAttachment = file => ({
  name: file.filename,
  url: file.url,
})

const CurrentVersion = ({ journal, forms, manuscript }) => (
  <Wrapper>
    <Heading1>Submission information</Heading1>

    <Intro>
      <div>
        We have ingested your manuscript. To access your manuscript in an
        editor, please{' '}
        <Link to={`/journal/versions/${manuscript.id}/manuscript`}>
          view here
        </Link>
        .
      </div>
      <div>
        To complete your submission, please answer the following questions.
      </div>
      <div>The answers will be automatically saved.</div>
    </Intro>

    <Metadata manuscript={manuscript} />
    <Declarations forms={forms} manuscript={manuscript} />
    <Suggestions manuscript={manuscript} />
    <SupplementaryFiles manuscript={manuscript} />
    {filterFileManuscript(manuscript.files || []).length > 0 && (
      <Section id="files.manuscript">
        <Legend space>Submitted Manuscript</Legend>
        <Attachment
          file={filesToAttachment(filterFileManuscript(manuscript.files)[0])}
          key={filterFileManuscript(manuscript.files)[0].url}
          uploaded
        />
      </Section>
    )}
  </Wrapper>
)

export default CurrentVersion
