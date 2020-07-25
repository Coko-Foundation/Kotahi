import { th } from '@pubsweet/ui-toolkit'
import styled from 'styled-components'

export const BigProfileImage = styled.img`
  width: calc(${th('gridUnit')} * 6);
  height: calc(${th('gridUnit')} * 6);
  object-fit: cover;
  border-radius: 50%;
`

export const SmallProfileImage = styled.img`
  width: calc(${th('gridUnit')} * 4);
  height: calc(${th('gridUnit')} * 4);
  object-fit: cover;
  border-radius: 50%;
`
