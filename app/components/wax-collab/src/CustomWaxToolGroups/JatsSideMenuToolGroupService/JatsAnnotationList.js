import React from 'react'
import { decorate, injectable, inject } from 'inversify'
import { LeftMenuTitle } from 'wax-prosemirror-components'
import { ToolGroup } from 'wax-prosemirror-services'

class JatsAnnotationList extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title="JATS Annotation List" />)

  constructor(
    @inject('Appendix') appendix,
    @inject('AppendixHeader') appendixHeader,
    @inject('MixedCitation') mixedCitation,
    @inject('FrontMatter') frontMatter,
  ) {
    super()
    this.tools = [frontMatter, mixedCitation, appendix, appendixHeader]
  }
}

decorate(injectable(), JatsAnnotationList)

export default JatsAnnotationList
