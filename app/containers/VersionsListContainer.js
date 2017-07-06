import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateCollection } from 'pubsweet-client/src/actions/collections'
import { updateFragment } from 'pubsweet-client/src/actions/fragments'

import VersionsList from '../components/VersionsList'

const VersionsListContainer = ({ project, versions }) => {
  if (!project) return null
  if (!versions.length) return null

  return <VersionsList project={project} versions={versions}/>
}

VersionsListContainer.propTypes = {
  project: PropTypes.object.isRequired,
  versions: PropTypes.array.isRequired,
  updateCollection: PropTypes.func.isRequired,
  updateFragment: PropTypes.func.isRequired
}

export default connect(
  (state, ownProps) => ({
    project: state.collections
      .find(collection => collection.id === ownProps.params.project),
    versions: state.collections
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
)(VersionsListContainer)
