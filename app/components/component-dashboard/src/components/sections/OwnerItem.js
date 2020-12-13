/* eslint-disable react/prop-types */

import React from 'react'
import { Link } from 'react-router-dom'
import { Item, StatusBadge } from '../../style'
import VersionTitle from './VersionTitle'
import { Icon, ClickableSectionRow } from '../../../../shared'
import theme from '../../../../../theme'

const OwnerItem = ({ version, journals, deleteManuscript }) => (
  // Links are based on the original/parent manuscript version
  <Link
    key={`version-${version.id}`}
    to={`/journal/versions/${version.parentId || version.id}/submit`}
  >
    <ClickableSectionRow>
      <Item>
        <div>
          {' '}
          <StatusBadge
            minimal
            published={version.published}
            status={version.status}
          />
          <VersionTitle version={version} />
        </div>
        <Icon color={theme.colorSecondary} noPadding size={2.5}>
          chevron_right
        </Icon>
        {/* {actions} */}
      </Item>
    </ClickableSectionRow>
  </Link>
)

export default OwnerItem
