import React, { useContext } from 'react'
// eslint-disable-next-line no-unused-vars
import { decorate, injectable, inject } from 'inversify'
import { isEmpty } from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import styled from 'styled-components'
import { WaxContext } from 'wax-prosemirror-core'
import { ToolGroup } from 'wax-prosemirror-services'
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'

const DropdownStyled = styled(Dropdown)`
  display: inline-flex;
  white-space: nowrap;
  cursor: not-allowed;
  opacity: ${props => (props.select ? 1 : 0.4)};
  pointer-events: ${props => (props.select ? 'default' : 'none')};
  .Dropdown-control {
    border: none;
    padding: 6px 52px 6px 6px;
  }
  .Dropdown-arrow {
    right: 25px;
    top: 16px;
  }
  .Dropdown-menu {
    top: calc(100% + 2px);
    width: 120%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    .Dropdown-option {
      width: 100%;
    }
  }
`

class KotahiBlockDropDown extends ToolGroup {
  tools = []

  constructor(
    @inject('Title') title,
    @inject('Author') author,
    @inject('SubTitle') subtitle,
    @inject('EpigraphProse') epigraphprose,
    @inject('EpigraphPoetry') epigraphpoetry,
    @inject('Heading2') heading2,
    @inject('Heading3') heading3,
    @inject('Heading4') heading4,
    @inject('Paragraph') paragraph,
    @inject('ParagraphContinued') paragraphContinued,
    @inject('ExtractProse') extractProse,
    @inject('ExtractPoetry') extractPoetry,
    @inject('SourceNote') sourceNote,
    @inject('BlockQuote') blockQuote,
    @inject('Heading5') heading5,
    @inject('Heading6') heading6,
  ) {
    super()

    this.tools = [
      title,
      author,
      subtitle,
      epigraphprose,
      epigraphpoetry,
      heading2,
      heading3,
      heading4,
      paragraph,
      paragraphContinued,
      extractProse,
      extractPoetry,
      sourceNote,
      blockQuote,
      heading5,
      heading6,
    ]
  }

  renderTools(view) {
    if (isEmpty(view) || window.innerWidth > 18800) return null

    const { activeViewId } = useContext(WaxContext)

    const { dispatch, state } = view

    /* eslint-disable no-underscore-dangle */
    const dropDownOptions = [
      { label: 'Title', value: '0', item: this._tools[0] },
      { label: 'Heading 2', value: '5', item: this._tools[5] },
      { label: 'Heading 3', value: '6', item: this._tools[6] },
      { label: 'Heading 4', value: '7', item: this._tools[7] },
      { label: 'Heading 5', value: '14', item: this._tools[14] },
      { label: 'Heading 6', value: '15', item: this._tools[15] },
      { label: 'Paragraph', value: '8', item: this._tools[8] },
      { label: 'Block quote', value: '13', item: this._tools[13] },
    ]
    /* eslint-enable no-underscore-dangle */

    const isDisabled = true // this was doing the weird thing with the title, disconnected for now.
    // if we want to re-enable it, go look in the Wax code

    let found = ''
    dropDownOptions.forEach((item, i) => {
      if (item.item.active(state, activeViewId) === true) {
        found = item.item.label
      }
    })

    return (
      <DropdownStyled
        key={uuidv4()}
        onChange={option => {
          /* eslint-disable-next-line no-underscore-dangle */
          this._tools[option.value].run(state, dispatch)
        }}
        options={dropDownOptions}
        placeholder="Block Level"
        select={isDisabled}
        value={found}
      />
    )
  }
}

decorate(injectable(), KotahiBlockDropDown)

export default KotahiBlockDropDown
