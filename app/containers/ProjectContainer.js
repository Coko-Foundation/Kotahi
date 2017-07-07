import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { deleteCollection, getCollection } from 'pubsweet-client/src/actions/collections'
import { getFragments } from 'pubsweet-client/src/actions/fragments'
import Project from '../components/Project'
import RemoveProject from '../components/RemoveProject'
import RolesSummary from '../components/RolesSummary'
import ProjectActions from '../components/ProjectActions'
import { selectCollection } from '../lib/selectors'

class ProjectContainer extends React.Component {
  componentDidMount () {
    const { params } = this.props

    this.fetch(params.project)
  }

  componentWillReceiveProps (nextProps) {
    const { params } = nextProps

    if (params.project !== this.props.params.project) {
      this.fetch(params.project)
    }
  }

  fetch (id) {
    const { getCollection, getFragments } = this.props

    getCollection({ id })

    getFragments({ id }, {
      fields: ['version', 'submitted']
    })
  }

  remove = () => {
    const { project, deleteCollection, push } = this.props

    if (!window.confirm('Delete this submission?')) {
      return
    }

    deleteCollection(project).then(() => {
      push('/')
    })
  }

  render () {
    const { project, children } = this.props

    if (!project) return null

    return (
      <div style={{ paddingBottom: 90 }}>
        <div className="container">
          <RemoveProject onClick={this.remove}/>

          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <Project project={project}>
                {children}
              </Project>
            </div>

            <div style={{ width: 200 }}>
              <ProjectActions project={project}/>

              {project.roles && (
                <RolesSummary project={project}/>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

ProjectContainer.propTypes = {
  children: PropTypes.node,
  params: PropTypes.object.isRequired,
  project: PropTypes.object,
  push: PropTypes.func.isRequired,
  getFragments: PropTypes.func.isRequired,
  deleteCollection: PropTypes.func.isRequired,
  getCollection: PropTypes.func.isRequired
}

export default connect(
  (state, ownProps) => ({
    project: selectCollection(state, ownProps.params.project)
  }),
  {
    getFragments,
    deleteCollection,
    getCollection,
    push
  }
)(ProjectContainer)
