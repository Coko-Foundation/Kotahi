/* eslint-disable react/jsx-handler-names */
/* eslint-disable no-underscore-dangle */
import React, { useMemo, useRef, useState } from 'react'
import Form from '@rjsf/core'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { isEqual } from 'lodash'
import { generateSchemas, tabKeyBasedSchema, tabLabels } from './ui/schema' // Import the function that generates the schema and uiSchema

import {
  ActionButton,
  Container,
  HeadingWithAction,
  Heading,
  SectionContent,
  HiddenTabs,
} from '../../shared'
import { color, space } from '../../../theme'

const StyledContainer = styled(Container)`
  --tabs-border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const StyledSectionContent = styled(SectionContent)`
  margin: 0;
  overflow-y: auto;
  padding: ${space.g} ${space.g} 0 ${space.g};
`

const StyledHeading = styled(Heading)`
  padding: 0.5rem 0 1.5rem;
`

const InstanceTypeLegend = styled.legend`
  border: 0;
  border-bottom: 1px solid #e5e5e5;
  color: #333;
  display: block;
  font-size: 21px;
  line-height: inherit;
  margin-bottom: 20px;
  padding: 0;
  width: 100%;
`

const StyledActionButton = styled(ActionButton)`
  margin-right: 20px;
  transition: all 0.2s;
  width: 10%;
`

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`

const Footer = styled.div`
  align-items: center;
  display: flex;
  gap: 1.5rem;
  justify-content: flex-end;
  padding-top: 0.6rem;

  > div {
    color: ${color.brand1.tint10};
    opacity: ${p => (p.$pending ? 1 : 0)};
    padding: 0 0.6rem;
    transition: opacity 0.2s;
  }
`

// #endregion Styleds
const StyledWrapper = styled.span`
  #form-integrations_publishing > legend:nth-of-type(1) {
    display: ${p => (p.$hideFirstLegend ? 'none' : 'block')};
  }
`

const FieldTemplate = props => {
  const { classNames, description, children, showInstanceType, t } = props
  const currentFieldName = key => description._owner.key === key
  // eslint-disable-next-line no-nested-ternary
  return !showInstanceType ? (
    !currentFieldName('instanceName') ? (
      <StyledWrapper $hideFirstLegend={currentFieldName('publishing')}>
        <div className={classNames}>
          {description}
          {children}
        </div>
      </StyledWrapper>
    ) : (
      ''
    )
  ) : (
    <div className={classNames}>
      {!currentFieldName('instanceName') ? (
        description
      ) : (
        <InstanceTypeLegend>{t('configPage.Instance Type')}</InstanceTypeLegend>
      )}
      {children}
    </div>
  )
}

const ConfigManagerForm = ({
  configId,
  disabled,
  formData: passedFormData,
  deleteFile,
  createFile,
  config,
  liveValidate = true,
  omitExtraData = true,
  updateConfig,
  updateConfigStatus,
  emailTemplates,
}) => {
  const { t } = useTranslation()
  const logoAndFavicon = useRef({})
  const initialFormData = useRef(passedFormData)
  const storedFormData = useRef(initialFormData.current)
  const [pendingChanges, setPendingChanges] = useState({})

  const seekForPendingChanges = (formData, properties, key) =>
    setPendingChanges(prev => {
      const isChanged = properties
        .flat()
        .some(
          p =>
            initialFormData.current[p] &&
            !isEqual(formData[p], initialFormData.current[p]),
        )

      return { ...prev, [key]: isChanged }
    })

  const schemas = useMemo(() => {
    const emailNotificationOptions = emailTemplates.map(template => {
      const emailOption = {
        const: template.id,
        title: template.emailContent.description,
      }

      return emailOption
    })

    // This will return first email template found of reviewer invitation type
    const defaultReviewerInvitationEmail = emailTemplates.find(
      emailTemplate => emailTemplate.emailTemplateType === 'reviewerInvitation',
    )

    // modifying the default reviewer invitation template into react json schema form structure
    const defaultReviewerInvitationTemplate = {
      const: defaultReviewerInvitationEmail.id,
      title: defaultReviewerInvitationEmail.emailContent.description,
    }

    // This will return first email template found of author proofing invitation type
    const defaultAuthorProofingInvitationEmail = emailTemplates.find(
      emailTemplate =>
        emailTemplate.emailTemplateType === 'authorProofingInvitation',
    )

    // modifying the default author proofing invitation template into react json schema form structure
    const defaultAuthorProofingInvitationTemplate = {
      const: defaultAuthorProofingInvitationEmail.id,
      title: defaultAuthorProofingInvitationEmail.emailContent.description,
    }

    // This will return first email template found of author proofing submitted type
    const defaultAuthorProofingSubmittedEmail = emailTemplates.find(
      emailTemplate =>
        emailTemplate.emailTemplateType === 'authorProofingSubmitted',
    )

    // modifying the default author proofing submitted template into react json schema form structure
    const defaultAuthorProofingSubmittedTemplate = {
      const: defaultAuthorProofingSubmittedEmail.id,
      title: defaultAuthorProofingSubmittedEmail.emailContent.description,
    }

    return generateSchemas(
      emailNotificationOptions,
      deleteFile,
      createFile,
      config,
      defaultReviewerInvitationTemplate,
      defaultAuthorProofingInvitationTemplate,
      defaultAuthorProofingSubmittedTemplate,
      t,
      logoAndFavicon,
    )
  }, [])

  const handlers = {
    form: {
      onChange: ({ formData }, properties, key) => {
        const updatedData = {
          ...storedFormData.current,
          ...formData,
        }

        seekForPendingChanges(formData, properties, key)
        storedFormData.current = updatedData
      },
      onSubmit: () => {
        const toSubmit = storedFormData.current
        const logoid = logoAndFavicon.current?.logo?.id || null
        const faviconid = logoAndFavicon.current?.icon?.id || null

        logoid && (toSubmit.groupIdentity.logoId = logoid)
        faviconid && (toSubmit.groupIdentity.favicon = faviconid)

        initialFormData.current = toSubmit
        storedFormData.current = toSubmit

        Object.keys(tabLabels).forEach(key =>
          seekForPendingChanges(toSubmit, tabKeyBasedSchema[key], key),
        )

        return updateConfig(configId, toSubmit)
      },
    },
  }

  const tabSections = useMemo(
    () =>
      Object.entries(tabLabels).map(([key, v]) => ({
        label: t(`configPage.${key}Tab`),
        key,
        content: (
          <StyledSectionContent>
            <StyledForm
              disabled={disabled}
              FieldTemplate={props => (
                <FieldTemplate
                  showInstanceType={key === 'general'}
                  t={t}
                  {...props}
                />
              )}
              formData={storedFormData.current}
              liveValidate={liveValidate}
              noHtml5Validate
              omitExtraData={omitExtraData}
              onChange={data =>
                handlers.form.onChange(data, tabKeyBasedSchema[key], key)
              }
              onSubmit={handlers.form.onSubmit}
              schema={schemas.data[key]}
              uiSchema={schemas.ui[key]}
            >
              <></>
            </StyledForm>
          </StyledSectionContent>
        ),
      })),
    [],
  )

  const noPendingChanges =
    updateConfigStatus !== 'pending' &&
    Object.values(pendingChanges).every(change => !change)

  return (
    <>
      <link
        crossOrigin="anonymous"
        href="https://cdn.jsdelivr.net/npm/bootstrap@3.4.1/dist/css/bootstrap.min.css"
        integrity="sha384-HSMxcRTRxnN+Bdg0JdbxYKrThecOKuH5zCYotlSAcp1+c8xmyTe9GYg1l9a69psu"
        rel="stylesheet"
      />
      <StyledContainer>
        <HeadingWithAction>
          <StyledHeading>{t('configPage.Configuration')}</StyledHeading>
        </HeadingWithAction>
        <HiddenTabs
          defaultActiveKey="general"
          sections={tabSections}
          shouldFillFlex
        />
        <Footer $pending={!noPendingChanges}>
          <div>You have unsaved changes.</div>
          <StyledActionButton
            disabled={disabled}
            onClick={handlers.form.onSubmit}
            primary
            status={updateConfigStatus}
            type="submit"
          >
            {t('common.Save')}
          </StyledActionButton>
        </Footer>
      </StyledContainer>
    </>
  )
}

export default ConfigManagerForm
