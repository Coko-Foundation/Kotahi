/* stylelint-disable */

// eslint-disable-next-line no-unused-vars
import { injectable, inject } from 'inversify'
import { ToolGroup } from 'wax-prosemirror-core'

@injectable()
class Anystyle extends ToolGroup {
  tools = []
  constructor(@inject('AnyStyleTool') anyStyleTool) {
    super()
    this.tools = [anyStyleTool]
  }
}

export default Anystyle
