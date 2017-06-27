import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { Link } from 'react-router'
import './ProjectListItem.css'

const ProjectListItem = ({ project }) => (
  <div className="project-list-item">
    <Link to={`/projects/${project.id}`} className="project-list-item-link">
      <div className="project-list-item-inner">
        <div className="project-list-item-status content-metadata">{project.status} on {moment(project.statusDate).format('YYYY-MM-DD')}</div>

        <div className="project-list-item-title">{project.title}</div>

        <div className="project-list-item-role content-metadata" style={{ display: 'flex' }}>
          <div className="project-list-item-role-title">Owner</div>
          <div className="project-list-item-role-name">{project.owner}</div>
        </div>
      </div>
    </Link>
  </div>
)

ProjectListItem.propTypes = {
  project: PropTypes.object.isRequired
}

export default ProjectListItem
