import React from 'react'
// eslint-disable-next-line no-unused-vars
import { decorate, injectable, inject } from 'inversify'
import { ToolGroup, LeftMenuTitle } from 'wax-prosemirror-core'

class AppendixGroup extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title="Appendices" />)

  constructor(@inject('Appendix') appendix) {
    super()
    this.tools = [appendix]
  }
}

decorate(injectable(), AppendixGroup)

export default AppendixGroup
