import React from 'react'
import PropTypes from 'prop-types'
import FRC from 'formsy-react-components'
import { Button } from 'react-bootstrap'

const styles = {
  textarea: {
    paddingLeft: 0,
    border: 'none',
    boxShadow: 'none',
    lineHeight: '21pt',
    background: 'linear-gradient(rgba(200, 200, 200, 0.5) 1pt, transparent 1pt) 0px 20pt / 100% 21pt'
  }
}

class DeclarationQuestions extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      declarations: {}
    }
  }

  componentDidMount () {
    const { declarations } = this.props

    this.setState({ declarations })
  }

  componentWillReceiveProps (nextProps) {
    const { declarations } = nextProps

    this.setState({ declarations })
  }

  changed = (declarations) => {
    this.setState({ declarations })
  }

  save = () => {
    this.props.save(this.state.declarations)
  }

  autoresize = name => () => {
    const textarea = this[name].element
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
    textarea.scrollTop = textarea.scrollHeight
    // window.scrollTo(window.scrollLeft, (textarea.scrollTop + textarea.scrollHeight))
  }

  render () {
    const { declarations = {} } = this.state

    // TODO: only display "submit" once declarations are complete

    return (
      <div className="questions questions-reset content-metadata">
        <FRC.Form
          onSubmit={this.save}
          validateOnSubmit={true}
          onChange={this.changed}
          layout="vertical">
          <div className="question-section">
            <div className="question-section-heading">PART I - Questions about ethics</div>

            <div className="question hide-control-label">
              <FRC.Checkbox
                name="human"
                label="This research included study of human participants or human tissue"
                value={declarations.human}/>
            </div>

            {declarations.human && (
              <div className="sub-question">
                <FRC.Textarea
                  name="humanReview"
                  label="Please name the Institutional Review Board which approved this research:"
                  value={declarations.humanReview}
                  rows={1}
                  // required
                  style={styles.textarea}
                  ref={input => (this.humanReviewTextarea = input)}
                  onChange={this.autoresize('humanReviewTextarea')}/>
              </div>
            )}

            <div className="question">
              <FRC.Textarea
                name="financialDisclosure"
                label="Please disclose your funders and the role they played in your manuscript:"
                value={declarations.financialDisclosure}
                rows={1}
                // required
                style={styles.textarea}
                ref={input => (this.financialDisclosureTextarea = input)}
                onChange={this.autoresize('financialDisclosureTextarea')}/>
            </div>
          </div>

          <div className="question-section">
            <div className="question-section-heading">PART II - Questions about new discoveries</div>

            <div className="question hide-control-label">
              <FRC.Checkbox
                name="newTaxon"
                label="Does your paper describe a new taxon?"
                value={declarations.newTaxon}/>
            </div>

            {declarations.newTaxon && (
              <div className="sub-question">
                <p>Please review <a href="https://submit.elifesciences.org/html/elife_author_instructions.html" target="_blank">our policies on new taxon nomenclature.</a></p>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <FRC.Checkbox
              name="accept"
              label="By checking this box, I accept the terms and conditions"
              value={declarations.accept}/>
          </div>

          <div style={{textAlign: 'center', marginTop: 40}}>
            <Button
              type="submit"
              bsStyle="primary"
              bsSize="large"
              style={{textTransform: 'uppercase'}}>Submit</Button>
          </div>
        </FRC.Form>
      </div>
    )
  }
}

DeclarationQuestions.propTypes = {
  declarations: PropTypes.object,
  save: PropTypes.func.isRequired
}

export default DeclarationQuestions
