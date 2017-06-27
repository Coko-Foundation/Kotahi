import React from 'react'
import PropTypes from 'prop-types'

import './ProjectDeclarations.css'

class ProjectDeclarationAnswers extends React.Component {
  render () {
    const { project } = this.props

    const { declarations = {} } = project

    return (
      <div className="answers questions-reset content-metadata">
        <div className="question-section">
          <div className="question-section-heading">PART I - Questions about ethics</div>

          <div className="question" style={{ marginBottom: 20 }}>
            <div className="answer-toggle">This research {declarations.human ? 'included' : 'did not include'} study of human participants or human tissue.</div>

            {declarations.humanReview && (
              <div className="content-text" style={{ whiteSpace: 'pre-wrap' }}>{declarations.humanReview}</div>
            )}
          </div>

          <div className="question" style={{ marginBottom: 20 }}>
            <div className="answer-title">Please disclose your funders and the role they played in your manuscript
            </div>
            <div className="content-text" style={{ whiteSpace: 'pre-wrap' }}>{declarations.financialDisclosure}</div>
          </div>
        </div>

        <div className="question-section">
          <div className="question-section-heading">PART II - Questions about new discoveries</div>

          <div className="question" style={{ marginBottom: 20 }}>
            <div className="answer-toggle">This research {declarations.newTaxon ? 'describes' : 'does not describe'} a new taxon.</div>
          </div>
        </div>
      </div>
    )
  }
}

ProjectDeclarationAnswers.propTypes = {
  project: PropTypes.object.isRequired
}

export default ProjectDeclarationAnswers
