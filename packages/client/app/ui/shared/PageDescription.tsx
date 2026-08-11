import { type ReactNode } from 'react'
import styled from 'styled-components'

import { grid, th } from '@coko/client'

const StyledPageDescription = styled.p`
  color: ${th('colorText')};
  margin-bottom: ${grid(6)};
  max-width: 60em;
`

type PageDescriptionProps = {
  children: ReactNode
}

const PageDescription = ({ children }: PageDescriptionProps): ReactNode => {
  return <StyledPageDescription>{children}</StyledPageDescription>
}

export default PageDescription
