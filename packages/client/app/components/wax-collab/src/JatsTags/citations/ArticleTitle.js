import { decorate, injectable } from 'inversify'
import { Commands, Tools } from 'wax-prosemirror-core'
import removeOrToggleMark from '../removeOrToggleMark'

class ArticleTitle extends Tools {
  title = 'Change to article title' // TODO: can I make this change dynamcically?
  label = 'Article title'
  color = 'colorArticleTitle'
  className = 'article-title'
  // icon = 'title'
  name = 'ArticleTitle'

  // eslint-disable-next-line class-methods-use-this
  get run() {
    return (state, dispatch) => {
      removeOrToggleMark(state, dispatch, 'articleTitle')
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
      return Commands.markActive(state.config.schema.marks.articleTitle)(state)
    }
  }
}

decorate(injectable(), ArticleTitle)

export default ArticleTitle
