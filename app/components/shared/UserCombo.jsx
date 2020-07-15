import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'

export const UserCombo = styled.div`
  display: flex;
  line-height: ${grid(2.5)};
  align-items: center;
`

export const Primary = styled.div`
  font-weight: 500;
`

export const Secondary = styled.div`
  color: ${th('colorTextPlaceholder')};
`

export const UserInfo = styled.div`
  margin-left: ${grid(1)};
`
