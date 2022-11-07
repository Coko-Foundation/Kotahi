import React, { useMemo } from 'react'
// eslint-disable-next-line no-unused-vars
import { decorate, injectable, inject } from 'inversify'
import { isEmpty } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { ToolGroup } from 'wax-prosemirror-services'
import { VerticalTabs, BlockLevelTools } from './VerticalTabs'

// nb this was forked from /wax-prosemirror-services/src/WaxToolGroups/DisplayTextToolGroupService/DisplayText.js

// QUESTIONS:
// 1) where do 'Display' and 'Text' come from? Those are the lists of elements that are coming in
// -- Text is coming from /wax-prosemirror-services/src/WaxToolGroups/TextToolGroupService/Text.js
// ---- though it's taking in other things
// -- Display is coming from /wax-prosemirror-services/src/WaxToolGroups/DisplayToolGroupService/Display.js
// ---- though it's also taking in other things
// 2) where are those paragraph formats defined?
// ----- from, e.g. /wax-prosemirror-schema/src/nodes/epigraphProseNode.js – this is similar to what I did to make H5/H6

class JatsSideMenu extends ToolGroup {
  tools = []
  toolGroups = []

  constructor(
    @inject('FrontMatterGroup') frontmattergroup,
    @inject('FundingGroup') fundinggroup,
    @inject('AppendixGroup') appendixgroup,
    @inject('CitationGroup') citationgroup,
    @inject('AcknowledgementsGroup') acknowledgementsgroup,
    @inject('KeywordGroup') keywordgroup,
    @inject('GlossaryGroup') glossarygroup,
  ) {
    super()

    this.toolGroups = [
      {
        name: 'FrontMatterTab',
        groups: [frontmattergroup, fundinggroup, keywordgroup],
      },
      {
        name: 'BackMatterTab',
        groups: [appendixgroup, acknowledgementsgroup, glossarygroup],
      },
      { name: 'CitationTab', groups: [citationgroup] },
    ]
  }

  /* eslint-disable no-underscore-dangle */
  renderTools(view) {
    if (isEmpty(view)) return null

    const frontMatterList = {
      id: 'frontmatterlist',
      title: 'Front matter tools',
      icon: 'frontMatter',
      disabled: false,
      component: (
        <BlockLevelTools
          groups={this._toolGroups[0].groups.map(group => ({
            groupName: group.title.props.title,
            items: group._tools,
          }))}
          view={view}
        />
      ),
    }

    const backMatterList = {
      id: 'backmatterlist',
      title: 'Back matter tools',
      icon: 'backMatter',
      disabled: false,
      component: (
        <BlockLevelTools
          groups={this._toolGroups[1].groups.map(group => ({
            groupName: group.title.props.title,
            items: group._tools,
          }))}
          view={view}
        />
      ),
    }

    const citationList = {
      id: 'citationlist',
      title: 'Citation tools',
      icon: 'citationList',
      disabled: false,
      component: (
        <BlockLevelTools
          groups={this._toolGroups[2].groups.map(group => ({
            groupName: group.title.props.title,
            items: group._tools,
          }))}
          view={view}
        />
      ),
    }

    const tabList = [frontMatterList, backMatterList, citationList]

    const TabsComponent = useMemo(
      () => <VerticalTabs key={uuidv4()} tabList={tabList} />,
      [],
    )

    return TabsComponent
  }
  /* eslint-enable no-underscore-dangle */
}

decorate(injectable(), JatsSideMenu)

export default JatsSideMenu
