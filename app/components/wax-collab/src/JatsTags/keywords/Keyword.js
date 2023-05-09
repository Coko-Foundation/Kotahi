import { decorate, injectable } from 'inversify'
import { toggleMark } from 'prosemirror-commands'
import { Commands, Tools } from 'wax-prosemirror-core'

class Keyword extends Tools {
  title = 'Change to keyword'
  label = 'Keyword'
  // color = 'colorKeyword'
  // className = 'keyword'
  // icon = 'title'
  name = 'Keyword'

  // eslint-disable-next-line class-methods-use-this
  get run() {
    return (state, dispatch) => {
      toggleMark(state.config.schema.marks.keyword)(state, dispatch)
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
      return Commands.markActive(state.config.schema.marks.keyword)(state)
    }
  }
}

decorate(injectable(), Keyword)

export default Keyword
