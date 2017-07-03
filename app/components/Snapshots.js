import React from 'react'
import PropTypes from 'prop-types'
import SnapshotActions from './SnapshotActions'
import ProjectActions from './ProjectActions'
import date from '../lib/date'
import '../components/Snapshots.css'

const Snapshots = ({ project, snapshots }) => (
  <div className="content-metadata">
    {snapshots.map(snapshot => (
      <div key={snapshot.id} className="snapshot">
        <div className="snapshot-status">
          <span>Version {snapshot.version}</span>
          <span> – </span>
          <span>{
            snapshot.submitted
              ? `submitted ${date.format(snapshot.submitted)}`
              : `imported ${date.format(snapshot.created)}`
          }</span>
        </div>

        <SnapshotActions project={project} snapshot={snapshot}/>
      </div>
    ))}

    <ProjectActions project={project}/>
  </div>
)

Snapshots.propTypes = {
  project: PropTypes.object.isRequired,
  snapshots: PropTypes.array.isRequired
}

export default Snapshots
