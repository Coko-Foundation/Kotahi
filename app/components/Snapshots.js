import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import moment from 'moment'
import { updateCollection } from 'pubsweet-client/src/actions/collections'
import { updateFragment } from 'pubsweet-client/src/actions/fragments'

import './Snapshots.css'

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
      <div>
        {snapshots.map((snapshot, index) => (
          <div key={snapshot.id} className="snapshot content-metadata">
            <div className="snapshot-status">Version {snapshot.version} – {snapshot.submitted ? `submitted ${formatDate(snapshot.submitted)}` : `imported ${formatDate(snapshot.created)}`}</div>

            <div className="snapshot-actions">
              <div>
                <Link to={`/editor/${project.id}/${snapshot.id}`} target="editor"
                      className="snapshot-link">{snapshot.submitted ? 'view your manuscript' : 'edit your manuscript'}</Link>
              </div>

              <div>
                <Link to={`/projects/${project.id}/declarations`}
                      className="snapshot-link">{snapshot.submitted ? 'view declarations' : 'submit for peer review'}</Link>
              </div>
            </div>
          </div>
        ))}
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
