import React, { useContext, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import { ConfigContext } from '../../config/src'
import { UPDATE_CONFIG } from '../../../queries'
import {
  createFileMutation,
  deleteFileMutation,
} from '../../component-cms-manager/src/queries'

import getSubmissionForm from './ConfigManager.queries'
import { CommsErrorBanner, Spinner } from '../../shared'
import ConfigManagerForm from './ConfigManagerForm'

const fileFields = `
  id
  name
  tags
  storedObjects {
    mimetype
    key
    url
    type
  }
`

const GET_CONFIG_AND_EMAIL_TEMPLATES = gql`
  query GetConfigAndEmailTemplates($id: ID!) {
    config(id: $id) {
      id
      formData
      active
      logo {
        ${fileFields}
      }
      
      icon {
        ${fileFields}
      }
      groupId
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
  const config = useContext(ConfigContext)
  const [update] = useMutation(UPDATE_CONFIG)
  const [createFile] = useMutation(createFileMutation)
  const [deleteFile] = useMutation(deleteFileMutation)
  const [updateConfigStatus, setUpdateConfigStatus] = useState(null)

  const { data: metadata, loading: loadingMetadata } = useQuery(
    getSubmissionForm,
    {
      variables: {
        groupId: config.groupId,
      },
    },
  )

  const { loading, error, data } = useQuery(GET_CONFIG_AND_EMAIL_TEMPLATES, {
    variables: { id: config?.id },
    fetchPolicy: 'network-only',
  })

  if ((loading && !data) || (!metadata && loadingMetadata)) return <Spinner />

  if (error) return <CommsErrorBanner error={error} />

  const updateConfig = async (configId, formData) => {
    setUpdateConfigStatus('pending')

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

  const { submissionForm = {} } = metadata || {}

  const form = submissionForm?.structure ?? {
    name: '',
    children: [],
    description: '',
    haspopup: 'false',
  }

  return (
    <ConfigManagerForm
      config={data.config}
      configId={data.config.id}
      createFile={createFile}
      deleteFile={deleteFile}
      disabled={!data.config.active}
      emailTemplates={data.emailTemplates}
      formData={JSON.parse(data.config.formData)}
      submissionForm={form}
      updateConfig={updateConfig}
      updateConfigStatus={updateConfigStatus}
    />
  )
}

export default ConfigManagerPage
