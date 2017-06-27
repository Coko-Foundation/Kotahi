import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'pubsweet-client/src/actions'
import ProjectListItem from './ProjectListItem'
import Upload from './Upload'

class ProjectList extends React.Component {
  componentDidMount () {
    const { actions } = this.props
    actions.getCollections() // TODO: pagination
  }

  render () {
    const { projects } = this.props

    return (
      <div className="content-text main">
        <div className="container">
          <div style={{ marginTop: 90, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 800 }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="project-list-item content-interactive">
                  <Upload/>
                </div>
              </div>

              {projects.map(project => (
                <ProjectListItem key={project.id} project={project}/>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ProjectList.propTypes = {
  actions: PropTypes.object.isRequired,
  projects: PropTypes.array.isRequired
}

const sortDescending = (field) => (a, b) => b[field] - a[field]

export default connect(
  state => ({
    projects: state.collections.sort(sortDescending('created'))
  }),
  dispatch => ({
    actions: bindActionCreators(actions, dispatch)
  })
)(ProjectList)
