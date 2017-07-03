import React from 'react'
import PropTypes from 'prop-types'
import FRC from 'formsy-react-components'
import { Button } from 'react-bootstrap'
import uuid from 'uuid'

// TODO: autocomplete search from a list of editors with roles on this journal

class EditorForm extends React.Component {
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
    return (
      <FRC.Form ref={form => (this.editorForm = form)} onSubmit={this.addEditor} validateOnSubmit={true} layout="vertical" className="content-interactive">
        <div>
          <FRC.Input type="text" name="name" label="Editor name"/>
        </div>

        <div style={{ marginTop: 20 }}>
          <Button type="submit" bsStyle="primary">Save</Button>
        </div>
      </FRC.Form>
    )
  }
}

EditorForm.propTypes = {
  project: PropTypes.object.isRequired,
  updateCollection: PropTypes.func.isRequired
}

export default EditorForm
