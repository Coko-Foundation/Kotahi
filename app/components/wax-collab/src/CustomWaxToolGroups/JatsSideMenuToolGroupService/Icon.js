import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { icons } from 'wax-prosemirror-components'
import { th } from '@pubsweet/ui-toolkit'

// Source: https://gitlab.coko.foundation/wax/wax-prosemirror/-/blob/master/wax-prosemirror-components/src/helpers/Icon.js
// modified to allow more icons, which can be defined like this:  https://gitlab.coko.foundation/wax/wax-prosemirror/-/blob/master/wax-prosemirror-components/src/icons/icons.js

const Svg = styled.svg.attrs(() => ({
  version: '1.1',
  xmlns: 'http://www.w3.org/2000/svg',
  xmlnsXlink: 'http://www.w3.org/1999/xlink',
}))`
  fill: ${th('colorPrimary')};
  height: 24px;
  vertical-align: top;
  width: 24px;
`

const kotahiIcons = {
  // TODO: insert new icons here
  demoCommentBubble: ({ className }) => (
    <Svg className={className} viewBox="0 0 24 24">
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
    </Svg>
  ),

  ...icons,
}

const SVGIcon = props => {
  const { className, name } = props
  const Component = kotahiIcons[name]
  return <Component className={className} />
}

SVGIcon.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
}

SVGIcon.defaultProps = { className: '' }

export default SVGIcon
