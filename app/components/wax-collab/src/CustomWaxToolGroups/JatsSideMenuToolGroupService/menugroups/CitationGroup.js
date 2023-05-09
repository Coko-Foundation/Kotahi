import React from 'react'
// eslint-disable-next-line no-unused-vars
import { decorate, injectable, inject } from 'inversify'
import { ToolGroup, LeftMenuTitle } from 'wax-prosemirror-core'

class CitationGroup extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title="Citations" />)

  constructor(
    @inject('RefList') refList,
    @inject('ArticleTitle') articleTitle,
    @inject('MixedCitationSpan') mixedCitationSpan,
    // @inject('AuthorGroup') authorGroup, // this isn't being shown currently
    @inject('AuthorName') authorName,
    @inject('JournalTitle') journalTitle,
    @inject('Doi') doi,
    @inject('FirstPage') firstPage,
    @inject('LastPage') lastPage,
    @inject('Volume') volume,
    @inject('CitationLabel') citationLabel,
    @inject('Issue') issue,
    @inject('Year') year,
    @inject('AnyStyleTool') anystyle,
  ) {
    super()
    this.tools = [
      refList,
      mixedCitationSpan,
      citationLabel,
      // authorGroup,
      authorName,
      articleTitle,
      journalTitle,
      doi,
      volume,
      issue,
      year,
      firstPage,
      lastPage,
      anystyle,
    ]
  }
}

decorate(injectable(), CitationGroup)

export default CitationGroup
