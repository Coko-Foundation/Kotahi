import React from 'react'
import { decorate, injectable, inject } from 'inversify'
import { LeftMenuTitle } from 'wax-prosemirror-components'
import { ToolGroup } from 'wax-prosemirror-services'

class AcknowledgementsGroup extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title="Acknowledgements" />)

  constructor(@inject('AcknowledgementsSection') acknowledgementsSection) {
    super()
    this.tools = [acknowledgementsSection]
  }
}

decorate(injectable(), AcknowledgementsGroup)

export default AcknowledgementsGroup
