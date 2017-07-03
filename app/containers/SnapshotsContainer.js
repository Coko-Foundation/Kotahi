import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateCollection } from 'pubsweet-client/src/actions/collections'
import { updateFragment } from 'pubsweet-client/src/actions/fragments'

import Snapshots from '../components/Snapshots'

class SnapshotsContainer extends React.Component {
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

    return <Snapshots project={project} snapshots={snapshots} submit={this.submit}/>
  }
}

SnapshotsContainer.propTypes = {
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
  {
    updateCollection,
    updateFragment
  }
)(SnapshotsContainer)
