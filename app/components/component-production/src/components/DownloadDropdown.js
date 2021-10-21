import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown } from '@pubsweet/ui'
import { htmlToJats } from '../../../../../server/utils/jatsUtils'

let html = ""

// added console to test options - to be removed later
const options = [
  { id: 1, onClick: () => {
    // eslint-disable-next-line
    console.log("HTML Selected")
  }, title: 'HTML',},
  { id: 2, onClick: () => {
    // eslint-disable-next-line
    console.log("PDF Selected")
  }, title: 'PDF', },
  { id: 3, onClick: () => {
    /* eslint-disable */
    console.log("XML Selected")
    console.log("HTML:", html)
    console.log("JATS:", htmlToJats(html))
    /* eslint-disable */
  }, title: 'XML', },
]

/* eslint-disable import/prefer-default-export */
export const DownloadDropdown = ({source}) => {
  html = source
  return (
    <Dropdown itemsList={options} primary>
      Download
    </Dropdown>
  )
}

DownloadDropdown.propTypes = {
  source: PropTypes.string.isRequired,
}
