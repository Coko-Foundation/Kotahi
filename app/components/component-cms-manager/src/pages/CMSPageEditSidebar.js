import React from 'react'
import styled from 'styled-components'

import { ChevronRight } from 'react-feather'
import { th, grid } from '@pubsweet/ui-toolkit'
import { Heading2, SidebarPageRow } from '../style'
import { RoundIconButton } from '../../../shared'

const RightArrow = styled(ChevronRight)`
  height: ${grid(2)};
  stroke: ${th('colorPrimary')};
  stroke-width: 4px;
  width: ${grid(2)};
`

const AddNewPage = styled(RoundIconButton)`
  margin-left: ${grid(1)};
  margin-top: ${grid(2)};
  min-width: 0px;
`

const CMSPageEditSidebar = ({
  isNewPage,
  cmsPages,
  currentCMSPage,
  onItemClick,
  onNewItemButtonClick,
}) => {
  return (
    <div>
      {cmsPages.map(cmsPage => (
        <SidebarPageRow key={cmsPage.id}>
          <Heading2 onClick={() => onItemClick(cmsPage)}>
            {cmsPage.title}
          </Heading2>
          {cmsPage.id === currentCMSPage.id ? <RightArrow /> : null}
        </SidebarPageRow>
      ))}

      <AddNewPage
        disabled={isNewPage}
        iconName="Plus"
        onClick={onNewItemButtonClick}
        primary
        title="Add a new page"
      />
    </div>
  )
}

export default CMSPageEditSidebar
