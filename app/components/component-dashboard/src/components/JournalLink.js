import React from 'react'
import { Link } from '@pubsweet/ui'
import PropTypes from 'prop-types'

const projectUrl = (version, page, id) => {
  const parts = []

  if (version) {
    parts.push('versions')
    parts.push(typeof version === 'object' ? version.id : version)
  }

  if (page) {
    parts.push(page)
  }

  /* if (id) {
    parts.push(id)
  } */

  return parts.join('/')
}

const JournalLink = ({ className, children, version, page, id }) => (
  <Link className={className} to={projectUrl(version, page, id)}>
    {children}
  </Link>
)

JournalLink.propTypes = {
  version: PropTypes.shape({
    id: PropTypes.string,
  }),
  page: PropTypes.string,
  id: PropTypes.string,
}

JournalLink.defaultProps = {
  version: undefined,
  page: undefined,
  id: undefined,
}
export default JournalLink
