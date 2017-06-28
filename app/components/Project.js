import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { browserHistory, Link } from 'react-router'
import { Button } from 'react-bootstrap'
import { deleteCollection, getCollection } from 'pubsweet-client/src/actions/collections'
import { getFragments } from 'pubsweet-client/src/actions/fragments'
import './Project.css'

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
    getFragments({ id })
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
              <div style={{ display: 'table', margin: 10, borderLeft: '1px solid #ddd' }}>
                <div style={{ display: 'table-row' }}>
                  <div style={{ display: 'table-cell', padding: '2px 5px 2px 15px', color: '#4990E2' }}>Owner</div>
                  <div style={{ display: 'table-cell', padding: '2px 5px' }}>{project.owner}</div>
                </div>
              </div>
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
    project: state.collections.find(collection => collection.id === ownProps.params.project)
  }),
  {
    getFragments,
    deleteCollection,
    getCollection
  }
)(Project)
