import React from 'react'
// import styled from 'styled-components'
// import { Link } from 'react-router-dom'
// import { Attachment } from '@pubsweet/ui'
// import { th } from '@pubsweet/ui-toolkit'
// import Metadata from './MetadataFields'
// import Declarations from './Declarations'
// import Suggestions from './Suggestions'
// import SupplementaryFiles from './SupplementaryFiles'
import Metadata from '../../../component-review/src/components/metadata/ReviewMetadata'
// import { Legend } from '../style'

// import {
//   Section,
//   SectionHeader,
//   SectionContent,
//   SectionRow,
//   Title,
// } from '../../../shared'

// const filterFileManuscript = files =>
//   files.filter(
//     file =>
//       file.type === 'manuscript' &&
//       file.mimeType ===
//         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//   )

// Due to migration to new Data Model
// Attachement component needs different data structure to work
// needs to change the pubsweet ui Attachement to support the new Data Model
// const filesToAttachment = file => ({
//   name: file.filename,
//   url: file.url,
// })

const CurrentVersion = ({ journal, forms, manuscript }) => (
  <Metadata manuscript={manuscript} />
)

export default CurrentVersion
