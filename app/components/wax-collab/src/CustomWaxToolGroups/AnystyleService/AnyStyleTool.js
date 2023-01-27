import React, { useContext } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { isEmpty } from 'lodash'
import { injectable } from 'inversify'
import { WaxContext /*, Commands */ } from 'wax-prosemirror-core'
import { Tools } from 'wax-prosemirror-services'
// import { wrapIn } from 'prosemirror-commands'
import AnyStyleButton from './components/AnyStyleButton'
import replaceText from './replaceText'

@injectable()
class AnyStyleTool extends Tools {
  name = 'AnyStyle'
  title = 'Convert with Anystyle'
  label = 'Automatic parser'

  get run() {
    return true
  }

  select = activeView => {
    return true
  }

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
