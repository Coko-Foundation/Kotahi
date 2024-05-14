import { decorate, injectable } from 'inversify'
import { Commands, Tools } from 'wax-prosemirror-core'
import removeOrToggleMark from '../removeOrToggleMark'

class AuthorName extends Tools {
  title = 'Change to author name'
  label = 'Author name'
  color = 'colorAuthorName'
  className = 'author-name'
  // icon = 'title'
  name = 'AuthorName'

  // eslint-disable-next-line class-methods-use-this
  get run() {
    return (state, dispatch) => {
      removeOrToggleMark(state, dispatch, 'authorName')
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
      return Commands.markActive(state.config.schema.marks.authorName)(state)
    }
  }
}

decorate(injectable(), AuthorName)

export default AuthorName
