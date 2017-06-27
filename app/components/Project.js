import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { browserHistory } from 'react-router'
import { Button } from 'react-bootstrap'
import actions from 'pubsweet-client/src/actions'
import Snapshots from './Snapshots'
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
    const { actions } = this.props

    actions.getCollection({ id })
    actions.getFragments({ id })
  }

  remove = () => {
    const { project, actions } = this.props

    if (!window.confirm('Delete this submission?')) {
      return
    }

    actions.deleteCollection(project).then(() => {
      browserHistory.push('/')
    })
  }

  render () {
    const { project } = this.props

    if (!project) return null

    return (
      <div className="content-text main" style={{paddingBottom: 90}}>
        <div className="container">
          <Button bsSize="small" bsStyle="link" onClick={this.remove} style={{ color: '#eee', background: 'none', position: 'fixed', top: 50, right: 50 }}><span className="fa fa-remove"/></Button>

          <div className="project-title">{project.title}</div>

          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <Snapshots project={project}/>
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
  actions: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  project: PropTypes.object
}

export default connect(
  (state, ownProps) => ({
    project: state.collections.find(collection => collection.id === ownProps.params.project)
  }),
  dispatch => ({
    actions: bindActionCreators(actions, dispatch)
  })
)(Project)
