import { injectable, inject } from 'inversify'
import { ToolGroup } from 'wax-prosemirror-services'

@injectable()
class Anystyle extends ToolGroup {
  tools = []
  constructor(@inject('AnyStyleTool') anyStyleTool) {
    super()
    this.tools = [anyStyleTool]
  }
}

export default Anystyle
