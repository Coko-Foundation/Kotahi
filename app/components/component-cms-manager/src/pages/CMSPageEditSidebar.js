import React from 'react'
import styled from 'styled-components'

import { ChevronRight } from 'react-feather'
import { th, grid } from '@pubsweet/ui-toolkit'
import { Heading2, SidebarPageRow } from '../style'

const RightArrow = styled(ChevronRight)`
  height: ${grid(2)};
  stroke: ${th('colorPrimary')};
  stroke-width: 4px;
  width: ${grid(2)};
`

const CMSPageEditSidebar = ({ cmsPages, currentCMSPage, onItemClick }) => {
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
    </div>
  )
}

export default CMSPageEditSidebar
