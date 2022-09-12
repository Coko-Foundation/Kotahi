import React from 'react'
import PropTypes from 'prop-types'
import { icons } from 'wax-prosemirror-components'

// Source: https://gitlab.coko.foundation/wax/wax-prosemirror/-/blob/master/wax-prosemirror-components/src/helpers/Icon.js
// modified to allow more icons, which can be defined like this:  https://gitlab.coko.foundation/wax/wax-prosemirror/-/blob/master/wax-prosemirror-components/src/icons/icons.js

const kotahiIcons = {
  // TODO: insert new icons here
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
