import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateCollection } from 'pubsweet-client/src/actions/collections'
import FRC from 'formsy-react-components'
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap'
import uuid from 'uuid'
import { LinkContainer } from 'react-router-bootstrap'

class Editor extends React.Component {
  addEditor = user => {
    const { project, updateCollection } = this.props

    const { roles } = project
    roles.editor = roles.editor || {}
    roles.editor[uuid()] = { user }

    updateCollection({
      id: project.id,
      roles
    })

    this.editorForm.reset()
  }

  render () {
    const { project } = this.props

    if (!project) return null

    const { roles } = project

    // TODO: only return editor details from the server to authorised users
    // TODO: implement role status (+ invitations property?)
    // TODO: autocomplete search from a list of editors with roles on this journal

    return (
      <div className="content-metadata">
        <h1>Editor</h1>

        <div className="content-interactive">
          <FRC.Form ref={form => (this.editorForm = form)} onSubmit={this.addEditor} validateOnSubmit={true}
                    layout="vertical">
            <div>
              <FRC.Input type="text" name="name" label="Editor name"/>
            </div>

            <div style={{ marginTop: 20 }}>
              <Button type="submit" bsStyle="primary">Save</Button>
            </div>
          </FRC.Form>
        </div>

        {roles.editor && (
          <ListGroup style={{marginTop: 20}}>
            {Object.keys(roles.editor).map(id => {
              const role = roles.editor[id]

              // TODO: use role.id instead of key

              return (
                <LinkContainer key={id} to={`/projects/${project.id}/roles/editor/${id}`} style={{textDecoration: 'none'}}>
                  <ListGroupItem header={role.user.name} className="clearfix">
                    <span style={{float: 'right'}}>{role.status || 'Pending'}</span>
                  </ListGroupItem>
                </LinkContainer>
              )
            })}
          </ListGroup>
        )}
      </div>
    )
  }
}

Editor.propTypes = {
  params: PropTypes.object.isRequired,
  project: PropTypes.object,
  updateCollection: PropTypes.func.isRequired
}

export default connect(
  (state, ownProps) => ({
    project: state.collections.find(collection => {
      return collection.id === ownProps.params.project
    })
  }),
  {
    updateCollection
  }
)(Editor)
