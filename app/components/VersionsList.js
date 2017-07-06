import React from 'react'
import PropTypes from 'prop-types'
import VersionActions from './VersionActions'
import * as date from '../lib/date'
import * as sort from '../lib/sort'
import '../components/Versions.css'

const sortByVersion = sort.descending('version')

const VersionsList = ({ project, versions }) => (
  <div className="content-metadata">
    {versions.sort(sortByVersion).map(version => (
      <div key={version.id} className="version">
        <div className="version-status">
          <span>Version {version.version}</span>
          <span> – </span>
          <span>{
            version.submitted
              ? `submitted ${date.format(version.submitted)}`
              : `imported ${date.format(version.created)}`
          }</span>
        </div>

        <VersionActions project={project} version={version}/>
      </div>
    ))}
  </div>
)

VersionsList.propTypes = {
  project: PropTypes.object.isRequired,
  versions: PropTypes.array.isRequired
}

export default VersionsList
