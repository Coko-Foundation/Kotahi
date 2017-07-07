import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateCollection } from 'pubsweet-client/src/actions/collections'
import { updateFragment } from 'pubsweet-client/src/actions/fragments'
import { selectCollection, selectFragments } from '../lib/selectors'
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
  (state, ownProps) => {
    const project = selectCollection(state, ownProps.params.project)

    const versions = selectFragments(state, project.fragments)

    return { project, versions }
  },
  {
    updateCollection,
    updateFragment
  }
)(VersionsListContainer)
