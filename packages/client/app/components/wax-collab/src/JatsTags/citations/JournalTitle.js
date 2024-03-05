import { decorate, injectable } from 'inversify'
import { Commands, Tools } from 'wax-prosemirror-core'
import removeOrToggleMark from '../removeOrToggleMark'

class JournalTitle extends Tools {
  title = 'Change to journal title'
  label = 'Journal title'
  color = 'colorJournalTitle'
  className = 'journal-title'
  // icon = 'title'
  name = 'JournalTitle'

  // eslint-disable-next-line class-methods-use-this
  get run() {
    return (state, dispatch) => {
      removeOrToggleMark(state, dispatch, 'journalTitle')
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
      return Commands.markActive(state.config.schema.marks.journalTitle)(state)
    }
  }
}

decorate(injectable(), JournalTitle)

export default JournalTitle
