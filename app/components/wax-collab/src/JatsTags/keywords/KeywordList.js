import React from 'react'
import { decorate, injectable } from 'inversify'
import { isEmpty } from 'lodash'
import { LeftSideButton } from 'wax-prosemirror-components'
import { Commands } from 'wax-prosemirror-utilities'
import { Tools } from 'wax-prosemirror-services'

class KeywordList extends Tools {
  title = 'Change to keyword list'
  label = 'Keyword list'
  name = 'KeywordList'
  // color = 'colorKeyWordList'
  // className = 'keywordlist'

  // eslint-disable-next-line class-methods-use-this
  get run() {
    return (state, dispatch) => {
      Commands.setBlockType(state.config.schema.nodes.keywordList)(
        state,
        dispatch,
      )
    }
  }

  // eslint-disable-next-line class-methods-use-this
  get active() {
    return (state, activeViewId) => {
      let isActive = false
      if (activeViewId !== 'main') return false

      const { from, to } = state.selection
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.type.name === 'keywordList') {
          isActive = true
        }
      })
      return isActive
    }
  }

  select = (state, activeViewId) => {
    if (activeViewId !== 'main') return false
    return true
  }

  // eslint-disable-next-line class-methods-use-this
  get enable() {
    return state => {
      return Commands.setBlockType(state.config.schema.nodes.keywordList)(state)
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null
    // eslint-disable-next-line no-underscore-dangle
    return this._isDisplayed ? (
      <LeftSideButton item={this.toJSON()} key="KeywordList" view={view} />
    ) : null
  }
}

decorate(injectable(), KeywordList)

export default KeywordList
