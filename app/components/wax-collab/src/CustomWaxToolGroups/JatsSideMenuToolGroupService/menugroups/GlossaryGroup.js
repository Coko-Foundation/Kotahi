import React from 'react'
import { decorate, injectable, inject } from 'inversify'
import { LeftMenuTitle } from 'wax-prosemirror-components'
import { ToolGroup } from 'wax-prosemirror-services'

class GlossaryGroup extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title="Glossary" />)

  constructor(
    @inject('GlossarySection') glossarySection,
    @inject('GlossaryItem') glossaryItem,
    @inject('GlossaryTerm') glossaryTerm,
  ) {
    super()
    this.tools = [glossarySection, glossaryItem, glossaryTerm]
  }
}

decorate(injectable(), GlossaryGroup)

export default GlossaryGroup
