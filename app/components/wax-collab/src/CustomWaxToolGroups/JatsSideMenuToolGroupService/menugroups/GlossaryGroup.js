import React from 'react'
// eslint-disable-next-line no-unused-vars
import { decorate, injectable, inject } from 'inversify'
import { ToolGroup, LeftMenuTitle } from 'wax-prosemirror-core'

class GlossaryGroup extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title="Glossary" />)

  constructor(
    @inject('GlossarySection') glossarySection,
    @inject('GlossaryTerm') glossaryTerm,
  ) {
    super()
    this.tools = [glossarySection, glossaryTerm]
  }
}

decorate(injectable(), GlossaryGroup)

export default GlossaryGroup
