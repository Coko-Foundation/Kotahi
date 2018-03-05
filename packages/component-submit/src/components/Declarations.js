import React from 'react'
import { css } from 'styled-components'
import { FormSection } from 'redux-form'
import { ValidatedField, RadioGroup, th } from '@pubsweet/ui'
import { withJournal } from 'xpub-journal'
import { required } from 'xpub-validators'
import { Section, Legend } from '../styles'

const hoverStyles = css`
  background-image: linear-gradient(to right, #666 50%, white 0%);
  background-position: 0 90%;
  background-repeat: repeat-x;
  background-size: 6px 1px;
  position: relative;
`

const DeclarationSection = Section.extend`
  margin: calc(${th('gridUnit')} * 2) 0;
  display: flex;
  justify-content: space-between;

  &:hover {
    ${props => !props.readonly && hoverStyles};
  }
`

const Declarations = ({ journal, readonly }) => (
  <FormSection name="declarations">
    {journal.declarations.questions.map(question => (
      <DeclarationSection id={`declarations.${question.id}`} key={question.id}>
        <Legend>{question.legend}</Legend>
        <ValidatedField
          component={props => (
            <RadioGroup inline options={question.options} {...props} />
          )}
          name={question.id}
          readonly={readonly}
          required
          validate={[required]}
        />
      </DeclarationSection>
    ))}
  </FormSection>
)

export default withJournal(Declarations)
