import React from 'react'
// eslint-disable-next-line no-unused-vars
import { decorate, injectable, inject } from 'inversify'
import { LeftMenuTitle } from 'wax-prosemirror-components'
import { ToolGroup } from 'wax-prosemirror-services'

class KeywordGroup extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title="Keywords" />)

  constructor(@inject('KeywordList') keywordList, @inject('Keyword') keyword) {
    super()
    this.tools = [keywordList, keyword]
  }
}

decorate(injectable(), KeywordGroup)

export default KeywordGroup
