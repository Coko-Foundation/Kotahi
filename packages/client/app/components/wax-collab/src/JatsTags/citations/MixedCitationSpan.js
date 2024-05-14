import { decorate, injectable } from 'inversify'
import { Commands, Tools } from 'wax-prosemirror-core'
import removeOrToggleMark from '../removeOrToggleMark'

class MixedCitationSpan extends Tools {
  title = 'Change to mixed citation'
  label = 'Mixed citation'
  color = 'colorCitation'
  // icon = 'title'
  name = 'MixedCitationSpan'

  // eslint-disable-next-line class-methods-use-this
  get run() {
    return (state, dispatch) => {
      removeOrToggleMark(state, dispatch, 'mixedCitationSpan')
    }
  }

  // eslint-disable-next-line class-methods-use-this
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
      return Commands.markActive(state.config.schema.marks.mixedCitationSpan)(
        state,
      )
    }
  }
}

decorate(injectable(), MixedCitationSpan)

export default MixedCitationSpan
