import React from 'react'
import { Link } from '@pubsweet/ui'

const projectUrl = ({ version, page, id }) => {
  const parts = []

  if (version) {
    parts.push('versions')
    parts.push(typeof version === 'object' ? version.id : version)
  }

  if (page) {
    parts.push(page)
  }

  if (id) {
    parts.push(id)
  }

  return parts.join('/')
}

const JournalLink = props => (
  <Link className={props.className} to={projectUrl(props)}>
    {props.children}
  </Link>
)

export default JournalLink
