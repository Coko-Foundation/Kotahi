import React from 'react'
import styled from 'styled-components'
import { th } from '@pubsweet/ui-toolkit'
import { Section, Legend } from '../style'

const SubLegend = styled(Legend)`
  font-weight: normal;
  margin-top: calc(${th('gridUnit')} * 3);
`

const SuggestionsNonEditable = ({ manuscript }) => {
  const suggestions = manuscript.suggestions || {}

  return [
    <Section id="suggestions.reviewers" key="suggestions.reviewers">
      <Legend>Suggested or opposed reviewers</Legend>
      <SubLegend>Suggested reviewers</SubLegend>
      <div>{suggestionsText(suggestions.reviewers, 'suggested')}</div>
      <SubLegend>Opposed reviewers</SubLegend>
      <div>{suggestionsText(suggestions.reviewers, 'opposed')}</div>
    </Section>,
    <Section id="suggestions.editors" key="suggestions.editors">
      <Legend>Suggested or opposed editors</Legend>
      <SubLegend>Suggested editors</SubLegend>
      <div>{suggestionsText(suggestions.editors, 'suggested')}</div>
      <SubLegend>Opposed editors</SubLegend>
      <div>{suggestionsText(suggestions.editors, 'opposed')}</div>
    </Section>,
  ]
}

const suggestionsText = (source, property) => {
  if (source && source[property]) {
    return source[property]
  }

  return 'none'
}

export default SuggestionsNonEditable
