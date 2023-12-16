import React from 'react'
import styled from 'styled-components'
import { Checkbox } from '@pubsweet/ui'
import { articleStatuses } from '../../../../globals'

const StyledCheckboxTable = styled(Checkbox)`
  height: 16px;
  margin-right: 15px;
  width: 18px;
`

const NewItemCheckbox = ({
  manuscript,
  selectedNewManuscripts,
  toggleNewManuscriptCheck,
}) => {
  if (
    manuscript.status !== articleStatuses.new ||
    manuscript.submission.$customStatus
  )
    return null

  return (
    <StyledCheckboxTable
      checked={selectedNewManuscripts.includes(manuscript.id)}
      onChange={() => toggleNewManuscriptCheck(manuscript.id)}
    />
  )
}

export default NewItemCheckbox
