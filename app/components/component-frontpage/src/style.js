import styled from 'styled-components'
import { th, grid } from '@pubsweet/ui-toolkit'

export const Container = styled.div`
  background: ${th('colorBackgroundHue')};
  padding: ${grid(2)};
  max-height: 100vh;
  min-height: 100vh;
  overflow-y: scroll;
}`

export const Placeholder = styled.div`
  display: grid;
  place-items: center;
  color: ${th('colorTextPlaceholder')};
  height: 100%;
  padding: 4em;
`

export const VisualAbstract = styled.img`
  max-width: ${grid(40)};
  max-height: ${grid(40)};
  display: block;
`
