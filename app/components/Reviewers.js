import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { updateCollection } from 'pubsweet-client/src/actions/collections'
import FRC from 'formsy-react-components'
import { Button } from 'react-bootstrap'
import uuid from 'uuid'

class Reviewers extends React.Component {
  addReviewer = data => {
    const { project, updateCollection } = this.props

    const reviewers = project.reviewers || {}

    const id = 'reviewer-' + uuid()

    reviewers[id] = data

    updateCollection({
      id: project.id,
      reviewers
    })
  }

  render () {
    const { project } = this.props

    if (!project) return null

    // TODO: only return reviewer details from the server to authorised users

    return (
      <div>
        <h1>Reviewers</h1>

        {project.reviewers && (
          <div>
            {Object.keys(project.reviewers).map(key => {
              const reviewer = project.reviewers[key]

              return (
                <div key={key}>{reviewer.name} {reviewer.email}</div>
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
