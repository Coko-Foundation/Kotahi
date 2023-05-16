import { decorate, injectable } from 'inversify'
import { Commands, Tools } from 'wax-prosemirror-core'
import removeOrToggleMark from '../removeOrToggleMark'

class LastPage extends Tools {
  title = 'Change to last page'
  label = 'Last page'
  color = 'colorLastPage'
  className = 'last-page'
  // icon = 'title'
  name = 'LastPage'

  // eslint-disable-next-line class-methods-use-this
  get run() {
    return (state, dispatch) => {
      removeOrToggleMark(state, dispatch, 'lastPage')
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
      return Commands.markActive(state.config.schema.marks.lastPage)(state)
    }
  }
}

decorate(injectable(), LastPage)

export default LastPage
