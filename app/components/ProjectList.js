import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Link } from 'react-router'

import './ProjectList.css'

const ProjectList = ({ projects }) => (
  <div>
    {projects.map(project => (
      <div className="project-list-item" key={project.id}>
        <Link to={`/projects/${project.id}`} className="project-list-item-link">
          <div className="project-list-item-inner">
            <div className="project-list-item-status content-metadata">
              <span>{project.status}</span>
              <span> on </span>
              <span>{moment(project.statusDate).format('YYYY-MM-DD')}</span>
            </div>

            <div className="project-list-item-title">{project.title}</div>

            <div className="project-list-item-role content-metadata" style={{ display: 'flex' }}>
              <div className="project-list-item-role-title">Owner</div>
              <div className="project-list-item-role-name">{Object.values(project.roles.owner).map(role => role.user.username).join(', ')}</div>
            </div>
          </div>
        </Link>
      </div>
    ))}
  </div>
)

ProjectList.propTypes = {
  projects: PropTypes.arrayOf(PropTypes.object).isRequired
}

export default ProjectList
