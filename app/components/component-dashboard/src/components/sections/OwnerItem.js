import React from 'react'
import { Link } from 'react-router-dom'
import config from 'config'
import PropTypes from 'prop-types'
import { Item, StatusBadge } from '../../style'
import VersionTitle from './VersionTitle'
import { Icon, ClickableSectionRow } from '../../../../shared'
import theme from '../../../../../theme'

const urlFrag = config.journal.metadata.toplevel_urlfragment

const OwnerItem = ({ version }) => {
  return (
    <Link
      key={`version-${version.id}`}
      to={`${urlFrag}/versions/${version.parentId || version.id}/submit`}
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
        </Item>
      </ClickableSectionRow>
    </Link>
  )
}

OwnerItem.propTypes = {
  version: PropTypes.oneOfType([PropTypes.object]).isRequired,
}

export default OwnerItem
