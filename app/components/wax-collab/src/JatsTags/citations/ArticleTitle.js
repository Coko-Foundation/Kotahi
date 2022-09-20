import { decorate, injectable } from 'inversify'
import { toggleMark } from 'prosemirror-commands'
import { Commands } from 'wax-prosemirror-utilities'
import { Tools } from 'wax-prosemirror-services'

class ArticleTitle extends Tools {
  title = 'Change to article title'
  label = 'Article title'
  color = 'colorArticleTitle'
  className = 'article-title'
  // icon = 'title'
  name = 'ArticleTitle'

  // eslint-disable-next-line class-methods-use-this
  get run() {
    return (state, dispatch) => {
      toggleMark(state.config.schema.marks.articleTitle)(state, dispatch)
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
      return Commands.markActive(state.config.schema.marks.articleTitle)(state)
    }
  }
}

decorate(injectable(), ArticleTitle)

export default ArticleTitle
