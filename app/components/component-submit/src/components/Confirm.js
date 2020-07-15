import React from 'react'
import styled from 'styled-components'
import { Button, PlainButton } from '@pubsweet/ui'
import { unescape } from 'lodash'
import { th } from '@pubsweet/ui-toolkit'
import { Heading1 } from '../style'

const Wrapper = styled.div`
  background: ${th('colorBackground')};
  color: ${th('colorText')};
  line-height: ${th('lineHeightBase')};
  max-height: 100%;
  max-width: 60em;
  overflow-y: auto;
  padding: calc(${th('gridUnit')} * 6);
`

const Paragraph = styled.p`
  font-size: ${th('fontSizeBase')};
  margin-bottom: calc(${th('gridUnit')} * 3);
  width: 100%;
`

const Divider = styled.span`
  margin: 0 ${th('gridUnit')};
`
const createMarkup = encodedHtml => ({
  __html: unescape(encodedHtml),
})

const Confirm = ({ toggleConfirming, form, submitSubmission }) => (
  <Wrapper>
    <article>
      <Heading1 dangerouslySetInnerHTML={createMarkup(form.popuptitle)} />
      <Paragraph
        dangerouslySetInnerHTML={createMarkup(form.popupdescription)}
      />
      <Button onClick={submitSubmission} primary type="submit">
        Submit your manuscript
      </Button>
      <Divider> or </Divider>
      <PlainButton onClick={toggleConfirming}>
        get back to your submission
      </PlainButton>
    </article>
  </Wrapper>
)

export default Confirm
