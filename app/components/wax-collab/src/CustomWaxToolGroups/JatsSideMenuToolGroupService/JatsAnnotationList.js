import React from 'react'
import { decorate, injectable, inject } from 'inversify'
import { LeftMenuTitle } from 'wax-prosemirror-components'
import { ToolGroup } from 'wax-prosemirror-services'

class AppendixList extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title="Appendices" />)

  constructor(
    @inject('Appendix') appendix,
    @inject('AppendixHeader') appendixHeader,
  ) {
    super()
    this.tools = [appendix, appendixHeader]
  }
}

class FrontMatterList extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title="Front Matter" />)

  constructor(@inject('FrontMatter') frontMatter) {
    super()
    this.tools = [frontMatter]
  }
}

class CitationList extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title="Citations" />)

  constructor(
    @inject('MixedCitation') mixedCitation,
    @inject('RefList') refList,
    @inject('ReferenceHeader') referenceHeader,
  ) {
    super()
    this.tools = [refList, referenceHeader, mixedCitation]
  }
}

decorate(injectable(), AppendixList)
decorate(injectable(), FrontMatterList)
decorate(injectable(), CitationList)

export { AppendixList, CitationList, FrontMatterList }
