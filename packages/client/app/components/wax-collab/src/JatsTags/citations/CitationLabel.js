import { decorate, injectable } from 'inversify'
import { Commands, Tools } from 'wax-prosemirror-core'
import removeOrToggleMark from '../removeOrToggleMark'

class CitationLabel extends Tools {
  title = 'Change to citation label'
  label = 'Citation label'
  color = 'colorCitationLabel'
  className = 'citation-label'
  // icon = 'title'
  name = 'CitationLabel'

  // eslint-disable-next-line class-methods-use-this
  get run() {
    return (state, dispatch) => {
      removeOrToggleMark(state, dispatch, 'citationLabel')
    }
  }

  select = state => {
    const {
      selection: { from },
    } = state

    if (from === null) return false
    return true
  }

  // eslint-disable-next-line class-methods-use-this
  get active() {
    return state => {
      return Commands.markActive(state.config.schema.marks.citationLabel)(state)
    }
  }
}

decorate(injectable(), CitationLabel)

export default CitationLabel
