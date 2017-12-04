import React from 'react'
import { Link } from 'react-router-dom'

const projectUrl = ({ project, version, page, id }) => {
  const parts = []

  parts.push('projects')
  parts.push(typeof project === 'object' ? project.id : project)

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

const ProjectLink = props => (
  <Link to={projectUrl(props)}>{props.children}</Link>
)

export default ProjectLink
