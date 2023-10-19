import React from 'react'
import styled from 'styled-components'
import { FieldArray } from 'formik'
import { TextField, ValidatedFieldFormik, Button } from '@pubsweet/ui'
import { th, grid } from '@pubsweet/ui-toolkit'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { DeleteControl } from '../../../../shared'

const Inline = styled.div`
  display: inline-block;
  margin-right: 10px;
  position: relative;
  vertical-align: top;
`

const UnbulletedList = styled.ul`
  list-style-type: none;
  padding-left: 0;
`

const InlineColorPicker = styled(Inline)`
  & > div {
    font-size: ${th('fontSizeBaseSmall')};
    line-height: ${th('lineHeightBaseSmall')};
    margin-bottom: ${grid(1)};
  }

  & input {
    height: ${grid(6)};
    width: ${grid(9)};
  }
`

const OptionsRow = styled.div`
  display: flex;
`

const StyledDeleteControl = styled(DeleteControl)`
  top: 0;
`

const LabelInput = props => (
  <TextField
    label={i18next.t('formBuilder.Label to display')}
    placeholder={i18next.t('formBuilder.Enter label')}
    {...props}
  />
)

const ValueInput = props => (
  <TextField
    label={i18next.t('formBuilder.Internal name')}
    placeholder={i18next.t('formBuilder.Enter name')}
    {...props}
  />
)

const ColorPicker = ({ name, value, onChange }) => {
  return (
    <input
      name={name}
      onChange={onChange}
      type="color"
      value={value || '#f7f7ff'}
    />
  )
}

const RenderOptions = ({ form: { values, setFieldValue }, push, remove }) => {
  const hasNewOption = values.options?.some(
    opt => opt === undefined || !opt.label || !opt.value,
  )

  const { t } = useTranslation()

  return (
    <UnbulletedList>
      {(values.options || []).map((option, index) => (
        // a newly-added option doesn't have an id yet, so we fall back on index
        <li key={option?.id ?? index}>
          <OptionsRow>
            <Inline>
              <ValidatedFieldFormik
                component={LabelInput}
                name={`options.${index}.label`}
                required
              />
            </Inline>
            <Inline>
              <ValidatedFieldFormik
                component={ValueInput}
                name={`options.${index}.value`}
                required
                validate={
                  null /* TODO Get the following validation working:
                  value =>
                  !/^[\w :./,()-<>=_]+$/.test(value) &&
                  'Internal name must not include special characters such as apostrophe or quotes'
                */
                }
              />
            </Inline>
            <Inline>
              <input
                checked={!!option?.labelColor}
                onChange={e => {
                  setFieldValue(
                    `options.${index}.labelColor`,
                    e.target.checked ? option?.labelColor || '#bbbbff' : null,
                  )
                }}
                type="checkbox"
              />
            </Inline>
            <InlineColorPicker>
              <div>{t('formBuilder.Color label')}</div>
              <ValidatedFieldFormik
                component={ColorPicker}
                name={`options.${index}.labelColor`}
              />
            </InlineColorPicker>
            <StyledDeleteControl
              onClick={() => remove(index)}
              tooltip={t('formBuilder.Delete this option')}
            />
          </OptionsRow>
        </li>
      ))}
      <li>
        <Button
          disabled={hasNewOption}
          onClick={() => push()}
          plain
          type="button"
        >
          {t('formBuilder.Add another option')}
        </Button>
      </li>
    </UnbulletedList>
  )
}

const OptionsField = () => (
  <FieldArray component={RenderOptions} name="options" />
)

export default OptionsField
