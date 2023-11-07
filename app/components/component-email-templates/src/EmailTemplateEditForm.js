import React, { useCallback, useEffect, useState } from 'react'
import { ValidatedFieldFormik } from '@pubsweet/ui'
import { required } from 'xpub-validators'
import { debounce, camelCase } from 'lodash'
import { useTranslation } from 'react-i18next'
import { emailTemplateInputFields } from '../../component-cms-manager/src/FormSettings'
import { ConfirmationModal } from '../../component-modal/src/ConfirmationModal'
import {
  FlexCenter,
  Section,
  Page,
  EditorForm,
  ActionButtonContainer,
  FormActionButton,
  FormActionDelete,
} from '../../component-cms-manager/src/style'
import { convertTimestampToDateTimeString } from '../../../shared/dateUtils'

const EmailTemplateEditForm = ({
  isNewEmailTemplate,
  onSubmit,
  onDelete,
  setFieldValue,
  setTouched,
  key,
  submitButtonStatus,
  activeTemplate,
  autoSaveData,
  currentValues,
}) => {
  const { t } = useTranslation()
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const autoSave = useCallback(debounce(autoSaveData ?? (() => {}), 1000), [])
  useEffect(() => autoSave.flush, [])

  const getInputFieldSpecificProps = item => {
    let props = {}

    switch (item.type) {
      case 'text-input':
        props.onChange = value => {
          let val = value

          if (value.target) {
            val = value.target.value
          } else if (value.value) {
            val = value.value
          }

          setFieldValue(item.name, val, false)
        }

        break

      case 'checkbox':
        props.handleChange = value => {
          const { checked } = value.target
          setFieldValue(item.name, checked)
        }

        break

      case 'SimpleWaxEditor':
        props.onChange = value => {
          setFieldValue(item.name, value)
        }

        break

      default:
        props = {}
    }

    return props
  }

  const requiredEmailTemplateTypes = [
    'reviewerInvitation',
    'systemEmail',
    'authorInvitation',
    'taskNotification',
  ]

  // Check if the activeTemplate corresponds to email templates that are required
  // (@mention notification, unread message digest, reviewer invitation, author invitation and task notification email).
  // If the activeTemplate is one of these required templates, hide the delete button.
  const isDeleteButtonHidden = requiredEmailTemplateTypes.includes(
    activeTemplate.emailTemplateType,
  )

  return (
    <Page>
      <EditorForm key={key} onSubmit={onSubmit}>
        {emailTemplateInputFields.map(item => {
          const isCheckBoxLabel = item.label === 'ccEditorsCheckboxDescription'
          const labelFontSize = isCheckBoxLabel ? '14px' : '10px'

          return (
            <Section
              flexGrow={item.flexGrow || false}
              key={item.name}
              style={item?.containerStyle || {}}
            >
              <label htmlFor={item.name} style={{ fontSize: labelFontSize }}>
                {t(`emailTemplate.${camelCase(item.label)}`)}
              </label>
              <ValidatedFieldFormik
                checked={currentValues?.ccEditors}
                component={item.component}
                id={item.name}
                name={item.name}
                setTouched={setTouched}
                style={{ ...(item?.itemStyle || { width: '100%' }) }}
                validate={item.isRequired ? required : null}
                {...item.otherProps}
                {...getInputFieldSpecificProps(item)}
              />
            </Section>
          )
        })}
        <ActionButtonContainer>
          <div>
            <FormActionButton
              onClick={onSubmit}
              primary
              status={!isNewEmailTemplate ? submitButtonStatus : null}
              type="button"
            >
              {isNewEmailTemplate
                ? t('emailTemplate.save')
                : t('emailTemplate.update')}
            </FormActionButton>
            {!isNewEmailTemplate && !isDeleteButtonHidden && (
              <FormActionDelete
                onClick={() => setIsConfirmingDelete(true)}
                style={{ minWidth: '104px' }}
              >
                {t('emailTemplate.delete')}
              </FormActionDelete>
            )}
          </div>
          {!isNewEmailTemplate && (
            <FlexCenter style={{ paddingRight: '50px' }}>
              {t('emailTemplate.Edited on', {
                date: convertTimestampToDateTimeString(activeTemplate.updated),
              })}
            </FlexCenter>
          )}
        </ActionButtonContainer>
        <ConfirmationModal
          closeModal={() => setIsConfirmingDelete(false)}
          confirmationAction={() => onDelete(activeTemplate)}
          confirmationButtonText={t('emailTemplate.delete')}
          isOpen={isConfirmingDelete}
          message={t('emailTemplate.permanentlyDelete')}
        />
      </EditorForm>
    </Page>
  )
}

export default EmailTemplateEditForm
