import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from '@pubsweet/ui'

/* eslint-disable import/prefer-default-export */
export const DownloadDropdown = ({
  manuscriptSource,
  manuscriptId,
  makePdf,
  makeJats,
}) => {
  const options = [
    {
      id: 1,
      onClick: () => {
        /* eslint-disable */
        console.log('HTML Selected')
        console.log('HTML:\n\n', manuscriptSource)
        // Raw HTML file opens in new tab
        let blob = new Blob([manuscriptSource], { type: 'text/html' })
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
        console.log('XML selected')
        makeJats(manuscriptId)
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
  manuscriptSource: PropTypes.string.isRequired,
  manuscriptId: PropTypes.string.isRequired,
  makePdf: PropTypes.func.isRequired,
  makeJats: PropTypes.func.isRequired,
}
