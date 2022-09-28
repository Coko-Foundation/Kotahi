import { decorate, injectable } from 'inversify'
import { toggleMark } from 'prosemirror-commands'
import { Commands } from 'wax-prosemirror-utilities'
import { Tools } from 'wax-prosemirror-services'

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
      toggleMark(state.config.schema.marks.authorGroup)(state, dispatch)
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
      return Commands.markActive(state.config.schema.marks.authorGroup)(state)
    }
  }
}

decorate(injectable(), AuthorGroup)

export default AuthorGroup
