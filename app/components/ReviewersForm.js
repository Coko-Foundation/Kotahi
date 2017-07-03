import React from 'react'
import PropTypes from 'prop-types'
import FRC from 'formsy-react-components'
import { Button } from 'react-bootstrap'
import uuid from 'uuid'

class ReviewersForm extends React.Component {
  addReviewer = user => {
    const { project, updateCollection } = this.props

    const { roles } = project
    roles.reviewer = roles.reviewer || {}
    roles.reviewer[uuid()] = { user }

    updateCollection({
      id: project.id,
      roles
    })

    this.reviewerForm.reset()
  }

  render () {
    return (
      <FRC.Form ref={form => (this.reviewerForm = form)} onSubmit={this.addReviewer} validateOnSubmit={true} layout="vertical">
        <div>
          <FRC.Input type="text" name="name" label="Reviewer name"/>
        </div>

        <div>
          <FRC.Input type="email" name="email" label="Reviewer email"/>
        </div>

        <div style={{ marginTop: 20 }}>
          <Button type="submit" bsStyle="primary">Save</Button>
        </div>
      </FRC.Form>
    )
  }
}

ReviewersForm.propTypes = {
  project: PropTypes.object,
  updateCollection: PropTypes.func.isRequired
}

export default ReviewersForm
