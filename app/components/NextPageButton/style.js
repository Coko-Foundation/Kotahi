import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'
import { hexa } from '../../globals'
import theme from '../../theme'

export const HasNextPage = styled(Link)`
  align-items: center;
  background: ${th('colorBackground')};
  display: flex;
  justify-content: center;
  text-decoration: none;
  width: 100%;
`

export const NextPageButton = styled.span`
  border-bottom: 1px solid ${hexa(theme.colorPrimary, 0.06)};
  border-top: 1px solid ${hexa(theme.colorPrimary, 0.06)};
  color: ${theme.colorPrimary};
  display: flex;
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  justify-content: center;
  margin-top: 16px;
  min-height: 40px;
  padding: 8px;
  position: relative;
  width: 100%;

  &:hover {
    background: ${hexa(theme.colorPrimary, 0.08)};
    color: ${theme.colorPrimary};
    cursor: pointer;
  }
`
