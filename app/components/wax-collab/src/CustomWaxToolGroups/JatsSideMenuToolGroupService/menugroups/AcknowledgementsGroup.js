import React from 'react'
// eslint-disable-next-line no-unused-vars
import { decorate, injectable, inject } from 'inversify'
import { ToolGroup, LeftMenuTitle } from 'wax-prosemirror-core'

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
