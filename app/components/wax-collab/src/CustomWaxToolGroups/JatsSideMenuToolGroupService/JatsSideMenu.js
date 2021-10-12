import React, { useMemo } from 'react'
import { decorate, injectable, inject } from 'inversify'
import { BlockLevelTools, Tabs } from 'wax-prosemirror-components'
import { isEmpty } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { ToolGroup } from 'wax-prosemirror-services'

// nb this was forked from /wax-prosemirror-services/src/WaxToolGroups/DisplayTextToolGroupService/DisplayText.js

// QUESTIONS:
// 1) where do 'Display' and 'Text' come from? Those are the lists of elements that are coming in
// -- Text is coming from /wax-prosemirror-services/src/WaxToolGroups/TextToolGroupService/Text.js
// ---- though it's taking in other things
// -- Display is coming from /wax-prosemirror-services/src/WaxToolGroups/DisplayToolGroupService/Display.js
// ---- though it's also taking in other things
// 2) where are those paragraph formats defined?
// ----- from, e.g. /wax-prosemirror-schema/src/nodes/epigraphProseNode.js – this is similar to what I did to make H5/H6

class JatsSideMenu extends ToolGroup {
  tools = []
  toolGroups = []

  constructor(
    @inject('Display') display,
    @inject('JatsAnnotationList') jatsannotationlist,
  ) {
    super()

    this.toolGroups = [
      {
        name: 'TabA',
        groups: [jatsannotationlist, display],
      },
    ]
  }

  renderTools(view) {
    if (isEmpty(view)) return null

    const first = {
      id: '1',
      title: 'display tools',
      icon: 'title',
      disabled: false,
      component: (
        <BlockLevelTools
          groups={this._toolGroups[0].groups.slice(0, 1).map(group => ({
            groupName: group.title.props.title,
            items: group._tools,
          }))}
          view={view}
        />
      ),
    }

    // if you wanted a second tab, enable this:

    // const second = {
    //   id: '2',
    //   title: 'text tools',
    //   icon: 'title', // what can this be?
    //   disabled: false,
    //   component: (
    //     <BlockLevelTools
    //       groups={this._toolGroups[0].groups.slice(1).map(group => ({
    //         groupName: group.title.props.title,
    //         items: group._tools,
    //       }))}
    //       view={view}
    //     />
    //   ),
    // }

    // const second = {
    //   id: '2',
    //   disabled: true,
    //   title: 'chapter list',
    //   icon: 'chapterList',
    //   component: <Empty />,
    // };

    const tabList = [first /*, second*/]

    const TabsComponent = useMemo(
      () => <Tabs key={uuidv4()} tabList={tabList} />,
      [],
    )

    return TabsComponent
  }
}

decorate(injectable(), JatsSideMenu)

export default JatsSideMenu
