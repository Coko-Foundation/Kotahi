import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'
import { hexa } from '../../globals'
import theme from '../../theme'

export const HasNextPage = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  background: ${th('colorBackground')};
  width: 100%;
`

export const NextPageButton = styled.span`
  display: flex;
  flex: 1;
  margin-top: 16px;
  justify-content: center;
  padding: 8px;
  // background: ${hexa(theme.colorPrimary, 0.04)};
  color: ${theme.colorPrimary};
  border-top: 1px solid ${hexa(theme.colorPrimary, 0.06)};
  border-bottom: 1px solid ${hexa(theme.colorPrimary, 0.06)};
  font-size: 15px;
  font-weight: 500;
  position: relative;
  min-height: 40px;
  width: 100%;

  &:hover {
    color: ${theme.colorPrimary};
    cursor: pointer;
    background: ${hexa(theme.colorPrimary, 0.08)};
  }
`
