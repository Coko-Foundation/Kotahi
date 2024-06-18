import React from 'react'
import styled from 'styled-components'
import FullWaxEditor from '../../../../wax-collab/src/FullWaxEditor'

const FullWaxEditorStyled = styled(FullWaxEditor)`
  div.wax-surface-scroll {
    min-width: 70%;
  }
`

const FullWaxField= input => {
  return <FullWaxEditorStyled {...input} useComments />
}

export default FullWaxField
