import React from 'react'
import { Link } from 'react-router-dom'
import theme from '../../../../theme'
import { Icon } from '../../../shared'

const SubmitChevron = ({ manuscript, urlFrag }) => {
  return (
    <Link
      to={`${urlFrag}/versions/${manuscript.parentId || manuscript.id}/submit`}
    >
      <Icon color={theme.colorSecondary} noPadding size={2.5}>
        chevron_right
      </Icon>
    </Link>
  )
}

export default SubmitChevron
