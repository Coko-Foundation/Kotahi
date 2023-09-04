import React from 'react'
import { decorate, injectable } from 'inversify'
import { isEmpty } from 'lodash'
import { LeftSideButton, Commands, Tools } from 'wax-prosemirror-core'

class ReferenceTool extends Tools {
  title = 'Change to reference'
  label = 'Reference'
  name = 'Reference'

  // eslint-disable-next-line class-methods-use-this
  get run() {
    // console.log('in run')

    return (state, dispatch) => {
      Commands.setBlockType(state.config.schema.nodes.reference, {
        class: 'ref',
      })(state, dispatch)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  get active() {
    return (state, activeViewId) => {
      let isActive = false

      const currentViewPossible =
        activeViewId === 'main' || activeViewId.indexOf('note-') === 0

      // console.log(
      //   'in getactive, currentViewPossible:',
      //   currentViewPossible,
      //   activeViewId,
      // )
      if (!currentViewPossible) return false
      // console.log('could be active')
      const { from, to } = state.selection
      state.doc.nodesBetween(from, to, node => {
        if (node.type.name === 'reference') {
          // console.log('active!')
          isActive = true
        }
      })
      return isActive
    }
  }

  select = (state, activeViewId) => {
    if (activeViewId !== 'main' && activeViewId.indexOf('note-') !== 0)
      return false
    return true
  }

  // eslint-disable-next-line class-methods-use-this
  get enable() {
    return state => {
      return Commands.setBlockType(state.config.schema.nodes.reference)(state)
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null
    // eslint-disable-next-line no-underscore-dangle
    return this._isDisplayed ? (
      <LeftSideButton item={this.toJSON()} key="Reference" view={view} />
    ) : null
  }
}

decorate(injectable(), ReferenceTool)

export default ReferenceTool
