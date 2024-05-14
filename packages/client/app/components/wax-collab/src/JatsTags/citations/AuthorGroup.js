import { decorate, injectable } from 'inversify'
import { Commands, Tools } from 'wax-prosemirror-core'
import removeOrToggleMark from '../removeOrToggleMark'

class AuthorGroup extends Tools {
  title = 'Change to author group'
  label = 'Author group'
  color = 'colorAuthorGroup'
  className = 'author-group'
  // icon = 'title'
  name = 'AuthorGroup'

  // eslint-disable-next-line class-methods-use-this
  get run() {
    return (state, dispatch) => {
      removeOrToggleMark(state, dispatch, 'authorGroup')
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
      return Commands.markActive(state.config.schema.marks.authorGroup)(state)
    }
  }
}

decorate(injectable(), AuthorGroup)

export default AuthorGroup
