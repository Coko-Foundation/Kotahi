import React from 'react'
import { th } from '@pubsweet/ui-toolkit'
import styled from 'styled-components'

const Settings = styled.div`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  flex: 1 1 0%;
`

const StyledHeader = styled.div`
  display: flex;
  padding-top: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid ${th('colorBorder')};
  background: ${th('colorBackground')};
  width: 100%;
  align-items: center;
`

export const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`

export const Heading = styled.h1`
  margin-left: calc(${th('gridUnit')} * 3);
  font-size: 32px;
  color: ${th('colorText')};
  font-weight: 800;
`

export const Subheading = styled.h3`
  margin-left: 16px;
  font-size: 16px;
  color: ${th('colorFurniture')};
  font-weight: 400;
  line-height: 1.3;
  &:hover {
    color: ${th('colorPrimary')};
  }
`

const PageWithHeader = ({ children, header }) => (
  <Settings>
    <StyledHeader>
      <HeaderText>
        <Heading>{header}</Heading>
      </HeaderText>
    </StyledHeader>
    {children}
  </Settings>
)

export default PageWithHeader
