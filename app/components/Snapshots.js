import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import actions from 'pubsweet-client/src/actions'
import ProjectDeclarations from './ProjectDeclarations'
import ProjectDeclarationAnswers from './ProjectDeclarationAnswers'

import './Snapshots.css'

const formatDate = date => moment(date).format('YYYY-MM-DD')

class Snapshots extends React.Component {
  submit = (snapshot) => {
    const { project, actions } = this.props

    actions.updateFragment(project, {
      id: snapshot.id,
      submitted: Date.now()
    })

    project.status = 'submitted'
    project.statusDate = Date.now()

    actions.updateCollection(project)
  }

  render () {
    const { project, snapshots } = this.props

    if (!snapshots.length) return null

    // TODO: only display "submit for review" once declarations are complete

    return (
      <div>
        {snapshots.map((snapshot, index) => (
          <div key={snapshot.id} className="snapshot">
            <div className="snapshot-heading-row">
              <div className="snapshot-heading content-metadata">
                <span className="snapshot-status">Version {snapshot.version} – {snapshot.submitted ? `submitted ${formatDate(snapshot.submitted)}` : `imported ${formatDate(snapshot.created)}`}</span>

                <Link to={`/editor/${project.id}/${snapshot.id}`} target="editor" className="snapshot-editor-link">{snapshot.submitted ? 'view your manuscript' : 'edit your manuscript'}</Link>
              </div>
            </div>

            <div style={{ display: 'table-row' }}>
              <div style={{display: 'table-cell'}}>
                {snapshot.submitted ? (
                  <div>
                    <ProjectDeclarationAnswers project={project}/>
                  </div>
                ) : (
                  <div className="content-metadata">
                    <ProjectDeclarations project={project} submit={() => this.submit(snapshot)}/>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
}

Snapshots.propTypes = {
  actions: PropTypes.object.isRequired,
  project: PropTypes.object.isRequired,
  snapshots: PropTypes.array.isRequired
}

export default connect(
  (state, ownProps) => ({
    snapshots: ownProps.project.fragments.map(id => state.fragments[id]).filter(fragment => fragment) // TODO: there shouldn't be any missing
  }),
  dispatch => ({
    actions: bindActionCreators(actions, dispatch)
  })
)(Snapshots)
