import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from '@pubsweet/ui'
import { makeJats } from '../../../../../server/utils/jatsUtils'
// import makePdf from './makePdf'

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
export const DownloadDropdown = ({ source, metadata, makePdf }) => {
  html = source
  const articleMetadata = buildArticleMetadata(metadata)

  const options = [
    {
      id: 1,
      onClick: () => {
        /* eslint-disable */
        console.log('HTML Selected')
        console.log('HTML:\n\n', html)
        // Raw HTML file opens in new tab
        let blob = new Blob([html], { type: 'text/html' })
        let url = URL.createObjectURL(blob)
        window.open(url)
        URL.revokeObjectURL(url)
        /* eslint-disable */
      },
      title: 'HTML',
    },
    {
      id: 2,
      onClick: () => {
        // eslint-disable-next-line
        console.log('PDF Selected')
        makePdf('title')
      },
      title: 'PDF',
    },
    {
      id: 3,
      onClick: () => {
        const { jats } = makeJats(html, articleMetadata, journalMetadata)
        /* eslint-disable */
        console.log('XML Selected')
        console.log('HTML:\n\n', html)
        console.log('JATS:\n\n', jats)
        // JATS XML file opens in new tab
        let blob = new Blob([jats], { type: 'text/xml' })
        let url = URL.createObjectURL(blob)
        window.open(url)
        URL.revokeObjectURL(url)
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
