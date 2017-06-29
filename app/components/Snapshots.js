import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import moment from 'moment'
import { updateCollection } from 'pubsweet-client/src/actions/collections'
import { updateFragment } from 'pubsweet-client/src/actions/fragments'

import './Snapshots.css'
import SnapshotActions from './SnapshotActions'
import ProjectActions from './ProjectActions'

const formatDate = date => moment(date).format('YYYY-MM-DD')

class Snapshots extends React.Component {
  submit = (snapshot) => {
    const { project, updateFragment, updateCollection } = this.props

    updateFragment(project, {
      id: snapshot.id,
      submitted: Date.now()
    })

    project.status = 'submitted'
    project.statusDate = Date.now()

    updateCollection(project)
  }

  render () {
    const { project, snapshots } = this.props

    if (!project) return null
    if (!snapshots.length) return null

    return (
      <div className="content-metadata">
        {snapshots.map((snapshot, index) => (
          <div key={snapshot.id} className="snapshot">
            <div className="snapshot-status">Version {snapshot.version} – {snapshot.submitted ? `submitted ${formatDate(snapshot.submitted)}` : `imported ${formatDate(snapshot.created)}`}</div>

            <SnapshotActions project={project} snapshot={snapshot}/>
          </div>
        ))}

        <ProjectActions project={project}/>
      </div>
    )
  }
}

Snapshots.propTypes = {
  project: PropTypes.object.isRequired,
  snapshots: PropTypes.array.isRequired,
  updateCollection: PropTypes.func.isRequired,
  updateFragment: PropTypes.func.isRequired
}

export default connect(
  (state, ownProps) => ({
    project: state.collections
      .find(collection => collection.id === ownProps.params.project),
    snapshots: state.collections
    // TODO: collection id on fragment instead
      .find(collection => collection.id === ownProps.params.project)
      .fragments.map(id => state.fragments[id])
      // TODO: there shouldn't be any missing
      .filter(fragment => fragment)
  }),
  { updateFragment, updateCollection }
)(Snapshots)
