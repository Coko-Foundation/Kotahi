import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from '@pubsweet/ui'
import { splitFrontBodyBack } from '../../../../../server/utils/jatsUtils'

let html = ''

const buildArticleMetadata = metadata => {
  const articleMetadata = {}

  if (metadata?.meta?.manuscriptId) {
    articleMetadata.id = metadata.meta.manuscriptId
  }

  if (metadata?.meta?.title) {
    articleMetadata.title = metadata.meta.title
  }

  if (metadata?.created) {
    articleMetadata.pubDate = metadata.created
  }

  if (metadata?.submission) {
    articleMetadata.submission = JSON.parse(metadata.submission)
  }

  return articleMetadata
}

// this should probably come from config/journal/metadata.js, though the data's not there yet.

const journalMetadata = {
  journalId: [
    { type: 'pmc', value: 'BMJ' },
    { type: 'publisher', value: 'BR MED J' },
  ],
  journalTitle: 'Journal Title',
  abbrevJournalTitle: 'Jour.Ti.',
  issn: [
    { type: 'print', value: '1063-777X' },
    { type: 'electronic', value: '1090-6517' },
  ],
  publisher: 'Journal Publisher Inc.',
}

// added console to test options - to be removed later

/* eslint-disable import/prefer-default-export */
export const DownloadDropdown = ({ source, metadata }) => {
  html = source
  const articleMetadata = buildArticleMetadata(metadata)

  const options = [
    {
      id: 1,
      onClick: () => {
        // eslint-disable-next-line
        console.log('HTML Selected')
      },
      title: 'HTML',
    },
    {
      id: 2,
      onClick: () => {
        // eslint-disable-next-line
        console.log('PDF Selected')
      },
      title: 'PDF',
    },
    {
      id: 3,
      onClick: () => {
        /* eslint-disable */
        console.log('XML Selected')
        console.log('HTML:\n\n', html)
        console.log(
          'JATS:\n\n',
          splitFrontBodyBack(html, articleMetadata, journalMetadata).jats,
        )
        /* eslint-disable */
      },
      title: 'XML',
    },
  ]

  return (
    <Dropdown itemsList={options} primary>
      Download
    </Dropdown>
  )
}

DownloadDropdown.propTypes = {
  source: PropTypes.string.isRequired,
  metadata: PropTypes.object,
}
