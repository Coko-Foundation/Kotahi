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
        // eslint-disable-next-line
        console.log('HTML Selected')
        // eslint-disable-next-line
        console.log('HTML:\n\n', manuscriptSource)

        // Raw HTML file opens in new tab
        const blob = new Blob([manuscriptSource], {
          type: 'text/html;charset=utf8',
        })

        const url = URL.createObjectURL(blob)
        window.open(url)
        URL.revokeObjectURL(url)
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
        // eslint-disable-next-line
        console.log('JATS selected')
        makeJats(manuscriptId)
      },
      title: 'JATS',
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
