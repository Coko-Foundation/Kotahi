import React from 'react'
import styled from 'styled-components'
import { Section, Legend } from '../style'

const Abstract = styled.div`
  word-wrap: break-word;
`

const MetadataFields = ({ manuscript }) => [
  <Section id="meta.title" key="meta.title">
    <Legend>Title</Legend>
    <div>{manuscript.meta.title}</div>
  </Section>,
  <Section id="meta.abstract" key="meta.abstract">
    <Legend>Abstract</Legend>
    <Abstract>{manuscript.meta.abstract}</Abstract>
  </Section>,
  <Section id="meta.keywords" key="meta.keywords">
    <Legend>Keywords</Legend>
    <div>{manuscript.meta.keywords}</div>
  </Section>,
]

export default MetadataFields
