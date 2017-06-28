import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateCollection } from 'pubsweet-client/src/actions/collections'
import FRC from 'formsy-react-components'
import { Button } from 'react-bootstrap'
import uuid from 'uuid'

class Reviewers extends React.Component {
  addReviewer = user => {
    const { project, updateCollection } = this.props

    const { roles } = project
    roles.reviewer = roles.reviewer || {}
    roles.reviewer[uuid()] = { user }

    updateCollection({
      id: project.id,
      roles
    })
  }

  render () {
    const { project } = this.props

    if (!project) return null

    const { roles } = project

    // TODO: only return reviewer details from the server to authorised users

    return (
      <div>
        <h1>Reviewers</h1>

        {roles.reviewer && (
          <div>
            {Object.keys(roles.reviewer).map(key => {
              const user = roles.reviewer[key].user

              return (
                <div key={key}>{user.name} &lt;{user.email}&gt;</div>
              )
            })}
          </div>
        )}

        <div className="content-interactive">
          <FRC.Form onSubmit={this.addReviewer} validateOnSubmit={true} layout="vertical">
            <div>
              <FRC.Input type="text" name="name" label="Reviewer name"/>
            </div>

            <div>
              <FRC.Input type="email" name="email" label="Reviewer email"/>
            </div>

            <div style={{ marginTop: 20 }}>
              <Button type="submit" bsStyle="primary">Add reviewer</Button>
            </div>
          </FRC.Form>
        </div>
      </div>
    )
  }
}

Reviewers.propTypes = {
  params: PropTypes.object.isRequired,
  project: PropTypes.object,
  updateCollection: PropTypes.func.isRequired
}

export default connect(
  (state, ownProps) => ({
    project: state.collections.find(collection => collection.id === ownProps.params.project)
  }),
  {
    updateCollection
  }
)(Reviewers)
