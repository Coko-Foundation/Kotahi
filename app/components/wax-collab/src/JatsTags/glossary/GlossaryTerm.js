import { decorate, injectable } from 'inversify'
import { toggleMark } from 'prosemirror-commands'
import { Commands } from 'wax-prosemirror-utilities'
import { Tools } from 'wax-prosemirror-services'

class GlossaryTerm extends Tools {
  title = 'Change to glossary term'
  label = 'Glossary term'
  // color = 'colorGlossaryTerm'
  // className = 'glossaryTerm'
  // icon = 'title'
  name = 'GlossaryTerm'

  // eslint-disable-next-line class-methods-use-this
  get run() {
    return (state, dispatch) => {
      toggleMark(state.config.schema.marks.glossaryTerm)(state, dispatch)
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
      return Commands.markActive(state.config.schema.marks.glossaryTerm)(state)
    }
  }
}

decorate(injectable(), GlossaryTerm)

export default GlossaryTerm
