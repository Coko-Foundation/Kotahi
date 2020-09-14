import React, { useState } from 'react'
import styled from 'styled-components'
import { Button } from '@pubsweet/ui'
import { th } from '@pubsweet/ui-toolkit'
import { JournalContext } from '../../../../xpub-journal/src'

const Root = styled.div``

const AccordionBody = styled.div``
const Title = styled.span`
  font-size: ${th('fontSizeHeading5')};
  font-family: ${th('fontHeading')};
  line-height: ${th('lineHeightHeading5')};
`

const ToggleReview = ({ open, toggle }) => (
  <Button onClick={toggle} plain>
    {open ? 'Hide' : 'Show'}
  </Button>
)

const Bullet = ({ journal, recommendation }) => {
  const recommendationColor = () =>
    recommendation
      ? journal.recommendations.find(item => item.value === recommendation)
          .color
      : 'black'

  const Dot = styled.span`
    border-radius: 100%;
    display: inline-block;
    height: 10px;
    margin-right: 10px;
    width: 10px;
    background-color: ${recommendationColor};
  `

  return <Dot />
}

const AccordionHeading = ({
  journal,
  name,
  open,
  ordinal,
  recommendation,
  toggleOpen,
  component,
  withDots,
}) => {
  const Root = styled.div`
    display: flex;
    align-items: baseline;
    margin-bottom: calc(${th('gridUnit')} * 3);
  `

  const Ordinal = styled(Title)``
  const Controls = styled.span``

  const Head = styled.div`
    ${() => !withDots && 'border-bottom: 1px solid #000;'};
    align-items: baseline;
    display: flex;
    flex: 1;
    justify-content: space-between;
  `

  const Dots = styled.span`
    background-image: linear-gradient(to right, #666 50%, white 0%);
    background-position: 0 90%;
    background-repeat: repeat-x;
    background-size: 6px 1px;
    position: relative;
    height: 1px;
    flex: 1;
    margin-left: 10px;
  `

  return (
    <Root>
      {recommendation && (
        <Bullet journal={journal} recommendation={recommendation} />
      )}
      <Head>
        <Ordinal>
          {name} {ordinal}
        </Ordinal>
        {withDots && <Dots />}
        <Controls>
          <ToggleReview open={open} toggle={toggleOpen} />
        </Controls>
      </Head>
      {component}
    </Root>
  )
}

const Accordion = ({ ordinal, title, status, Component, withDots }) => {
  const [open, setOpen] = useState(false)
  const toggleOpen = setOpen(!open)

  return (
    <Root>
      <JournalContext.Consumer>
        {journal => (
          <AccordionHeading
            journal={journal}
            name={title}
            open={open}
            ordinal={ordinal}
            recommendation={status}
            toggleOpen={toggleOpen}
            withDots={withDots || false}
          />
        )}
      </JournalContext.Consumer>
      {open && <AccordionBody>{Component}</AccordionBody>}
    </Root>
  )
}

export default Accordion
