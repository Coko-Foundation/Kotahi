import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { browserHistory, Link } from 'react-router'
import { Button } from 'react-bootstrap'
import { deleteCollection, getCollection } from 'pubsweet-client/src/actions/collections'
import { getFragments } from 'pubsweet-client/src/actions/fragments'
import './Project.css'
import RolesSummary from './RolesSummary'

class Project extends React.Component {
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
    const { project, deleteCollection } = this.props

    if (!window.confirm('Delete this submission?')) {
      return
    }

    deleteCollection(project).then(() => {
      browserHistory.push('/')
    })
  }

  render () {
    const { project, children } = this.props

    if (!project) return null

    // TODO: how to ensure that user info is loaded for each role?

    return (
      <div className="content-text main" style={{paddingBottom: 90}}>
        <div className="container">
          <Button bsSize="small" bsStyle="link" onClick={this.remove} style={{ color: '#eee', background: 'none', position: 'fixed', top: 50, right: 50 }}><span className="fa fa-remove"/></Button>

          <div className="project-title">
            <Link to={`/projects/${project.id}`}>{project.title}</Link>
          </div>

          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1 }}>
              {children}
            </div>

            <div className="content-metadata" style={{ width: 200 }}>
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

Project.propTypes = {
  children: PropTypes.node,
  params: PropTypes.object.isRequired,
  project: PropTypes.object,
  getFragments: PropTypes.func.isRequired,
  deleteCollection: PropTypes.func.isRequired,
  getCollection: PropTypes.func.isRequired
}

export default connect(
  (state, ownProps) => ({
    project: state.collections.find(collection => {
      return collection.id === ownProps.params.project
    })
  }),
  {
    getFragments,
    deleteCollection,
    getCollection
  }
)(Project)
