import React from 'react'
import { LayoutMainHeading, LayoutSecondaryHeading } from '../style'
import PageOrder from './PageOrder'

const Header = ({ cmsLayout, onPageOrderUpdated }) => {
  return (
    <div>
      <LayoutMainHeading>
        Header
        <LayoutSecondaryHeading>
          Use checkbox to show and hide the page in the menu. Click and Drag to
          order them.
        </LayoutSecondaryHeading>
      </LayoutMainHeading>
      <PageOrder
        initialItems={cmsLayout.flaxHeaderConfig}
        onPageOrderUpdated={onPageOrderUpdated}
      />
    </div>
  )
}

export default Header
