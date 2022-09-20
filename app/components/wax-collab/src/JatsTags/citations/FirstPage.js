import { decorate, injectable } from 'inversify'
import { toggleMark } from 'prosemirror-commands'
import { Commands } from 'wax-prosemirror-utilities'
import { Tools } from 'wax-prosemirror-services'

class FirstPage extends Tools {
  title = 'Change to first page'
  label = 'First page'
  color = 'colorFirstPage'
  className = 'first-page'
  // icon = 'title'
  name = 'FirstPage'

  // eslint-disable-next-line class-methods-use-this
  get run() {
    return (state, dispatch) => {
      toggleMark(state.config.schema.marks.firstPage)(state, dispatch)
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
      return Commands.markActive(state.config.schema.marks.firstPage)(state)
    }
  }
}

decorate(injectable(), FirstPage)

export default FirstPage
