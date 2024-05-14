import React, { useContext } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { isEmpty } from 'lodash'
import { injectable } from 'inversify'
import { WaxContext, Tools /*, Commands */ } from 'wax-prosemirror-core'
// import { wrapIn } from 'prosemirror-commands'
import AnyStyleButton from './components/AnyStyleButton'
import replaceText from './replaceText'

@injectable()
class AnyStyleTool extends Tools {
  name = 'AnyStyle'
  title = 'Convert with Anystyle'
  label = 'Automatic parser'

  // eslint-disable-next-line class-methods-use-this
  get run() {
    return true
  }

  // eslint-disable-next-line class-methods-use-this
  select = activeView => {
    return true
  }

  // eslint-disable-next-line class-methods-use-this
  get enable() {
    return state => {
      return true
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null
    const context = useContext(WaxContext)

    // TODO: make sure this is not inserting a blank line

    const anyStyle = replaceText(
      context.activeView, // view,
      this.config.get('config.AnyStyleService').AnyStyleTransformation,
      this.pmplugins.get('anyStylePlaceHolder'),
      context,
    )

    return this.isDisplayed() ? (
      <AnyStyleButton
        anyStyle={anyStyle}
        item={this.toJSON()}
        key={uuidv4()}
        view={view}
      />
    ) : null
  }
}

export default AnyStyleTool
