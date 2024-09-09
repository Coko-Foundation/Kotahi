import React, { useState } from 'react'
import styled from 'styled-components'
import { th } from '@coko/client'
import { useTranslation } from 'react-i18next'

import Flexbox from '../../../../pubsweet/Flexbox'
import Radio from '../../../../pubsweet/Radio'
import { TextField } from '../../../../pubsweet'
import { ActionButton } from '../../../../shared'
import ValidatedField from '../../../../component-submit/src/components/ValidatedField'

export const Legend = styled.div`
  font-size: ${th('fontSizeBase')};
  font-weight: 600;
  margin-bottom: ${({ space, theme }) => space && theme.gridUnit};
`

const CredentialsFlexbox = styled(Flexbox)`
  margin-top: 10px;
`

const TextFieldComponent = props => {
  return <TextField {...props} />
}

const CredentialFields = ({ s3Values, onChange, t }) => {
  const [credentials, setCredentials] = useState({
    accessId: null,
    accessToken: null,
    status: 'hide',
  })

  const onTextChange = field => event => {
    // eslint-disable-next-line no-shadow
    const { value } = event.target
    const v = credentials
    v[field] = value

    setCredentials({ ...v })
  }

  const updatePassword = () => {
    setCredentials({ ...credentials, status: 'hide' })

    const data = {
      ...s3Values,
      s3AccessId: credentials.accessId,
      s3AccessToken: credentials.accessToken,
    }

    onChange(data)
  }

  return credentials.status === 'hide' ? (
    <ActionButton
      onClick={() => setCredentials({ ...credentials, status: 'update' })}
    >
      {t('fields.uploadAttachmentSource.setCredentials')}
    </ActionButton>
  ) : (
    <>
      <Legend>{t('fields.uploadAttachmentSource.s3AccessId')}</Legend>
      <TextField
        name="s3AccessId"
        onChange={onTextChange('accessId')}
        value={credentials.accessId}
      />
      <Legend>{t('fields.uploadAttachmentSource.s3AccessToken')}</Legend>
      <TextField
        name="s3AccessToken"
        onChange={onTextChange('accessToken')}
        value={credentials.accessToken}
      />
      <ActionButton onClick={updatePassword}>
        {t('fields.uploadAttachmentSource.updateCredentials')}
      </ActionButton>
    </>
  )
}

const RadioboxS3ServiceBuilder = ({
  inline,
  value: componentValue,
  className,
  disabled,
  name,
  radioOptions,
  onChange,
}) => {
  const { t } = useTranslation()

  const handleChange = event => {
    // eslint-disable-next-line no-shadow
    const { value } = event.target
    const data = { ...componentValue, type: value }
    onChange(data)
  }

  const onTextChange = field => event => {
    // eslint-disable-next-line no-shadow
    const { value } = event.target
    const v = componentValue
    v[field] = value

    onChange(v)
  }

  return (
    <>
      <Flexbox column={!inline}>
        {radioOptions.map(option => (
          <Radio
            checked={option.value === componentValue.type}
            className={className}
            color={option.color}
            disabled={disabled || option.disabled}
            inline={inline}
            key={option.value}
            label={option.label}
            name={name}
            onChange={handleChange}
            value={option.value}
          />
        ))}
      </Flexbox>
      <CredentialsFlexbox column={inline}>
        {componentValue.type === 'external' && (
          <>
            <Legend>{t('fields.uploadAttachmentSource.s3Url')}</Legend>
            <ValidatedField
              component={TextFieldComponent}
              name="uploadAttachmentSource.s3Url"
              onChange={onTextChange('s3Url')}
              shouldAllowFieldSpecChanges="true"
              value={componentValue.s3Url}
            />
            <Legend>{t('fields.uploadAttachmentSource.s3Bucket')}</Legend>
            <ValidatedField
              component={TextFieldComponent}
              name="uploadAttachmentSource.s3Bucket"
              onChange={onTextChange('s3Bucket')}
              shouldAllowFieldSpecChanges="true"
              value={componentValue.s3Bucket}
            />
            <CredentialFields
              onChange={onChange}
              s3Values={componentValue}
              t={t}
            />
          </>
        )}
      </CredentialsFlexbox>
    </>
  )
}

export default RadioboxS3ServiceBuilder
