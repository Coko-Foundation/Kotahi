import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getCollections } from 'pubsweet-client/src/actions/collections'
import sort from '../lib/sort'
import ProjectList from '../components/ProjectList'
import UploadContainer from './UploadContainer'

class ProjectListContainer extends React.Component {
  componentDidMount () {
    // TODO: pagination
    this.props.getCollections({
      fields: ['created', 'status', 'statusDate', 'title', 'roles']
    })
  }

  render () {
    return (
      <div className="content-text main">
        <div className="container">
          <div style={{ marginTop: 90, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 800 }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="project-list-item content-interactive">
                  <UploadContainer/>
                </div>
              </div>

              <ProjectList projects={this.props.projects}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ProjectListContainer.propTypes = {
  getCollections: PropTypes.func.isRequired,
  projects: PropTypes.array.isRequired
}

export default connect(
  state => ({
    projects: state.collections.sort(sort.descending('created'))
  }),
  {
    getCollections
  }
)(ProjectListContainer)
