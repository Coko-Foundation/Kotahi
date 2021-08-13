import React from 'react'
import styled, { withTheme } from 'styled-components'
import { FieldArray } from 'formik'
import { TextField, ValidatedFieldFormik, Button, Icon } from '@pubsweet/ui'
import lightenBy from '../../../../../shared/lightenBy'

const Inline = styled.div`
  display: inline-block;
  margin-right: 10px;
  position: relative;
  vertical-align: top;
`

const UnbulletedList = styled.ul`
  list-style-type: none;
`

const DeleteControlContainer = styled(Inline)`
  padding: 32px 0 0 1em;
`

const DeleteButton = styled.button`
  background: none;

  &:hover {
    background-color: ${lightenBy('colorPrimary', 0.8)};
  }
`

const ControlIcon = withTheme(({ children, theme }) => (
  <Icon color={theme.colorPrimary}>{children}</Icon>
))

const labelInput = input => (
  <TextField label="Label to display" placeholder="Enter label…" {...input} />
)

const valueInput = input => (
  <TextField label="Internal name" placeholder="Enter name…" {...input} />
)

const renderOptions = ({ form: { values }, push, remove }) => {
  const hasNewOption = values.options.some(
    opt => opt === undefined || !opt.label || !opt.value,
  )

  return (
    <UnbulletedList>
      {(values.options || []).map((option, index) => (
        // a newly-added option doesn't have an id yet, so we fall back on index
        <li key={option?.id ?? index}>
          <div>
            <Inline>
              <ValidatedFieldFormik
                component={labelInput}
                name={`options.${index}.label`}
                required
              />
            </Inline>
            <Inline>
              <ValidatedFieldFormik
                component={valueInput}
                name={`options.${index}.value`}
                required
              />
            </Inline>
            <DeleteControlContainer>
              <DeleteButton
                onClick={() => remove(index)}
                title="Delete this option"
                type="button"
              >
                <ControlIcon>x</ControlIcon>
              </DeleteButton>
            </DeleteControlContainer>
          </div>
        </li>
      ))}
      <li>
        <Button
          disabled={hasNewOption}
          onClick={() => push()}
          plain
          type="button"
        >
          Add another option
        </Button>
      </li>
    </UnbulletedList>
  )
}

const OptionsField = () => (
  <FieldArray component={renderOptions} name="options" />
)

export default OptionsField
