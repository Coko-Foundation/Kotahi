import React, { useContext, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { ThemeContext } from 'styled-components'
import gql from 'graphql-tag'
import { ThemeUpdateContext } from '../../theme/src'
import { UPDATE_CONFIG } from '../../../queries'
import { CommsErrorBanner, Spinner } from '../../shared'
import ConfigManagerForm from './ConfigManagerForm'
import getColors from '../../../theme/colors'

const GET_CONFIG_AND_EMAIL_TEMPLATES = gql`
  query GetConfigAndEmailTemplates {
    config {
      id
      formData
      active
    }
    emailTemplates {
      id
      created
      updated
      emailTemplateType
      emailContent {
        cc
        subject
        body
        description
      }
    }
  }
`

const ConfigManagerPage = ({ match, ...props }) => {
  const currentTheme = useContext(ThemeContext)
  const updateTheme = useContext(ThemeUpdateContext)
  const [update] = useMutation(UPDATE_CONFIG)
  const [updateConfigStatus, setUpdateConfigStatus] = useState(null)

  const { loading, error, data } = useQuery(GET_CONFIG_AND_EMAIL_TEMPLATES)

  if (loading && !data) return <Spinner />

  if (error) return <CommsErrorBanner error={error} />

  const updateConfig = async (configId, formData) => {
    setUpdateConfigStatus('pending')
    updateTheme({
      ...currentTheme,
      colorPrimary: formData.groupIdentity.primaryColor,
      colorSecondary: formData.groupIdentity.secondaryColor,
      colors: getColors(
        formData.groupIdentity.primaryColor,
        formData.groupIdentity.secondaryColor,
      ),
    })

    const response = await update({
      variables: {
        id: configId,
        input: {
          formData: JSON.stringify(formData),
          active: true,
        },
      },
    })

    setUpdateConfigStatus(response.data.updateConfig ? 'success' : 'failure')

    return response
  }

  return (
    <ConfigManagerForm
      configId={data.config.id}
      disabled={!data.config.active}
      emailTemplates={data.emailTemplates}
      formData={JSON.parse(data.config.formData)}
      updateConfig={updateConfig}
      updateConfigStatus={updateConfigStatus}
    />
  )
}

export default ConfigManagerPage
