/* eslint-disable react/prop-types */

import React from 'react'
import styled from 'styled-components'

import { th } from '@pubsweet/ui-toolkit'

const Header = styled.div`
  font-family: ${th('fontHeading')};
  text-align: center;
  width: 100%;
`

const HeaderText = styled.div`
  color: ${th('colorText')};
  display: inline-block;
  line-height: ${th('lineHeightBase')};
  font-size: ${th('fontSizeBase')};
`

const ModalHeader = props => {
  const { className, text } = props

  return (
    <Header className={className}>
      <HeaderText>{text.toUpperCase()}</HeaderText>
    </Header>
  )
}

export default ModalHeader
