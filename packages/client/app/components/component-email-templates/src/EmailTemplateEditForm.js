// All this is refactored on !1710
import React, { useCallback, useEffect, useState } from 'react'
import { debounce } from 'lodash'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { emailTemplateInputFields } from '../../component-cms-manager/src/FormSettings'
import { ConfirmationModal } from '../../component-modal/src/ConfirmationModal'
import {
  FlexCenter,
  Section,
  EditorForm,
  ActionButtonContainer,
  FormActionButton,
  FormActionDelete,
} from '../../component-cms-manager/src/style'
import { convertTimestampToDateTimeString } from '../../../shared/dateUtils'
import EmailTemplateField from './EmailTemplateField'
import { color } from '../../../theme'

const REQUIRED_EMAIL_TEMPLATE_TYPES = [
  'reviewerInvitation',
  'systemEmail',
  'authorInvitation',
  'taskNotification',
]

const { keys } = Object

const getFormBadgeBg = form => {
  const colorVariations = {
    common: '#f0f0f0',
    decision: '#fffacb',
    review: '#ffddc2',
    submission: color.brand1.tint90,
  }

  const safeKey = keys(colorVariations).includes(form) ? form : 'common'
  return colorVariations[safeKey]
}

const Root = styled.div`
  height: 100%;
  position: relative;
  z-index: 0;

  span.handlebars {
    background-color: ${getFormBadgeBg('common')};
    border-radius: 5px;
    box-shadow: 0 0 6px 0 #0001, inset 0 0 4px 0 #0002;
    margin: 0;
    padding: 2px 4px;
    text-rendering: geometricPrecision;
  }

  span.handlebars.submission-form {
    background-color: ${getFormBadgeBg('submission')};
  }

  span.handlebars.review-form {
    background-color: ${getFormBadgeBg('review')};
  }

  span.handlebars.decision-form {
    background-color: ${getFormBadgeBg('decision')};
  }
`

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

  useEffect(() => {
    return () => {
      autoSave.flush()
    }
  }, [])

  const onDataChanged = (itemKey, value) => {
    const { created, updated, ...rest } = activeTemplate

    const data = {
      ...rest,
      emailContent: {
        ...activeTemplate.emailContent,
        [itemKey]: value,
      },
    }

    autoSave(rest.id, data)
  }

  // Check if the activeTemplate corresponds to email templates that are required
  // (@mention notification, unread message digest, reviewer invitation, author invitation and task notification email).
  // If the activeTemplate is one of these required templates, hide the delete button.
  const isDeleteButtonHidden = REQUIRED_EMAIL_TEMPLATE_TYPES.includes(
    activeTemplate.emailTemplateType,
  )

  return (
    <Root>
      <EditorForm key={key} onSubmit={onSubmit}>
        {emailTemplateInputFields.map(item => {
          return (
            <Section
              flexGrow={item.flexGrow || false}
              key={item.name}
              style={item?.containerStyle || {}}
            >
              <EmailTemplateField
                currentValues={currentValues}
                item={item}
                onDataChanged={onDataChanged}
                setFieldValue={setFieldValue}
                setTouched={setTouched}
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
              {isNewEmailTemplate ? t('common.Save') : t('common.Update')}
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
    </Root>
  )
}

export default EmailTemplateEditForm
