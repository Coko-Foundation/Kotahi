import React from 'react'
import PropTypes from 'prop-types'

import { Link } from '../../../pubsweet'

const ControlPageLink = ({ className, children, version, page, id }) => (
  <Link className={className} to={`versions/${id}/decision`}>
    {children}
  </Link>
)

ControlPageLink.propTypes = {
  version: PropTypes.shape({
    id: PropTypes.string,
  }),
  page: PropTypes.string,
  id: PropTypes.string,
}

ControlPageLink.defaultProps = {
  version: undefined,
  page: undefined,
  id: undefined,
}
export default ControlPageLink
