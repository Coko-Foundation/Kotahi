import React from 'react'
// eslint-disable-next-line no-unused-vars
import { decorate, injectable, inject } from 'inversify'
import { LeftMenuTitle } from 'wax-prosemirror-components'
import { ToolGroup } from 'wax-prosemirror-services'

class FrontMatterGroup extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title="Front Matter" />)

  constructor(
    @inject('FrontMatter') frontMatter,
    @inject('Title') title,
    @inject('Abstract') abstractSection,
  ) {
    super()
    this.tools = [frontMatter, title, abstractSection]
  }
}

decorate(injectable(), FrontMatterGroup)

export default FrontMatterGroup
