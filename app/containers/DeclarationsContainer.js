import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { updateCollection } from 'pubsweet-client/src/actions/collections'
import { updateFragment } from 'pubsweet-client/src/actions/fragments'
import DeclarationQuestions from '../components/DeclarationQuestions'
import DeclarationAnswers from '../components/DeclarationAnswers'

import './Declarations.css'

class Declarations extends React.Component {
  submit = declarations => {
    const { project, push, updateFragment, updateCollection } = this.props

    // save the declarations and set the project as submitted
    updateCollection({
      id: project.id,
      declarations,
      status: 'submitted',
      statusDate: Date.now()
    })

    // submit the latest snapshot
    updateFragment(project, {
      id: project.fragments[0], // TODO: sort, get latest
      submitted: Date.now()
    })

    // TODO: wait for the previous requests to finish
    push(`/projects/${project.id}`)
  }

  render () {
    const { project } = this.props

    if (!project) return null

    return project.status === 'submitted'
      ? <DeclarationAnswers declarations={project.declarations}/>
      : <DeclarationQuestions declarations={project.declarations} save={this.submit}/>
  }
}

Declarations.propTypes = {
  project: PropTypes.object.isRequired,
  push: PropTypes.func.isRequired,
  updateCollection: PropTypes.func.isRequired,
  updateFragment: PropTypes.func.isRequired
}

export default connect(
  (state, ownProps) => ({
    project: state.collections.find(collection => {
      return collection.id === ownProps.params.project
    })
  }),
  {
    push,
    updateFragment,
    updateCollection
  }
)(Declarations)
