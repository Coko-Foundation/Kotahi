import React from 'react'
import styled from 'styled-components'
import { Button, PlainButton, th } from '@pubsweet/ui'
import { Heading1 } from '../styles'

const Wrapper = styled.div`
  background: ${th('colorBackground')};
  color: ${th('colorText')};
  line-height: ${th('fontLineHeight')};
  max-height: 100%;
  max-width: 60em;
  overflow-y: auto;
  padding: calc(${th('gridUnit')} * 2);
`

const Paragraph = styled.p`
  font-size: ${th('fontSizeBase')};
  margin-bottom: ${th('gridUnit')};
  width: 55ch;
`

const Divider = styled.span`
  margin: 0 calc(${th('gridUnit')} / 2);
`

const Confirm = ({ toggleConfirming }) => (
  <Wrapper>
    <article>
      <Heading1>
        By submitting the manuscript, you agree to the following statements.
      </Heading1>

      <Paragraph>
        The corresponding author confirms that all co-authors are included, and
        that everyone listed as a co-author agrees to that role and all the
        following requirements and acknowledgements.
      </Paragraph>

      <Paragraph>
        The submission represents original work and that sources are given
        proper attribution. (The journal employs{' '}
        <a
          href="https://www.crossref.org/services/similarity-check/"
          rel="noopener noreferrer"
          target="_blank"
        >
          CrossCheck
        </a>{' '}
        to compare submissions against a large and growing database of published
        scholarly content. If in the judgment of a senior editor a submission is
        genuinely suspected of plagiarism, it will be returned to the author(s)
        with a request for explanation.)
      </Paragraph>

      <Paragraph>
        The research was conducted in accordance with ethical principles.
      </Paragraph>

      <Paragraph>
        There is a Data Accessibility Statement, containing information about
        the location of open data and materials, in the manuscript.
      </Paragraph>

      <Paragraph>
        A conflict of interest statement is present in the manuscript, even if
        to state no conflicts of interest.
      </Paragraph>

      <Button primary type="submit">
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
