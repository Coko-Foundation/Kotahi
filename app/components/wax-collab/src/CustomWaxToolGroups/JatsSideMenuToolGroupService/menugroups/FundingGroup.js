import React from 'react'
// eslint-disable-next-line no-unused-vars
import { decorate, injectable, inject } from 'inversify'
import { ToolGroup, LeftMenuTitle } from 'wax-prosemirror-core'

class FundingGroup extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title="Funding Group" />)

  constructor(
    @inject('FundingSource') fundingSource,
    @inject('AwardId') awardId,
    @inject('FundingStatement') fundingStatement,
  ) {
    super()
    this.tools = [fundingSource, awardId, fundingStatement]
  }
}

decorate(injectable(), FundingGroup)

export default FundingGroup
