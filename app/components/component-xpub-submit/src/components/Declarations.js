import React from 'react'
import styled from 'styled-components'
import ReactHtmlParser from 'react-html-parser'
import { get } from 'lodash'
import { th } from '@pubsweet/ui-toolkit'
import { Section, Legend } from '../styles'

const DeclarationSection = styled(Section)`
  margin: calc(${th('gridUnit')} * 6) 0;
`

const Declarations = ({ forms, manuscript }) => (
  <div>
    <DeclarationSection>
      <Legend>Type of article</Legend>
      {manuscript.meta.articleType}
    </DeclarationSection>
    {(forms.children || [])
      .filter(child => child.name.includes('meta.declarations'))
      .map(question => (
        <DeclarationSection key={`declaration-${question.id}`}>
          <Legend>{ReactHtmlParser(question.title)}</Legend>
          {get(manuscript, question.name)}
        </DeclarationSection>
      ))}
  </div>
)

export default Declarations
