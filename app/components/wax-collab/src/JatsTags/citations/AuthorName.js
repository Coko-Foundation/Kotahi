import { decorate, injectable } from 'inversify'
import { toggleMark } from 'prosemirror-commands'
import { Commands } from 'wax-prosemirror-utilities'
import { Tools } from 'wax-prosemirror-services'

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
      toggleMark(state.config.schema.marks.authorName)(state, dispatch)
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
      return Commands.markActive(state.config.schema.marks.authorName)(state)
    }
  }
}

decorate(injectable(), AuthorName)

export default AuthorName
