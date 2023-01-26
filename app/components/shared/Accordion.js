import React, { useState } from 'react'
import styled from 'styled-components'
import { ChevronDown, ChevronUp } from 'react-feather'
import { grid } from '@pubsweet/ui-toolkit'
import MinimalButton from './MinimalButton'
import { MediumRow } from './Containers'

const AccordionHead = styled(MinimalButton)`
  padding: 0;
`

const AccordionBody = styled.div`
  padding: 0 ${grid(1)} ${grid(2)} ${grid(4)};
`

const Accordion = ({ label, children, isOpenInitially }) => {
  const [isOpen, setIsOpen] = useState(!!isOpenInitially)

  return (
    <div>
      <AccordionHead onClick={() => setIsOpen(open => !open)}>
        <MediumRow>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          {label}
        </MediumRow>
      </AccordionHead>
      {isOpen && <AccordionBody>{children}</AccordionBody>}
    </div>
  )
}

export default Accordion
