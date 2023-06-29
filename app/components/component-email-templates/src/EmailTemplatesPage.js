import React from 'react'
import { useQuery } from '@apollo/client'
import { GET_EMAIL_TEMPLATES } from '../../../queries'
import { CommsErrorBanner, Spinner } from '../../shared'
import EmailTemplates from './EmailTemplates'

const EmailTemplatesPage = ({ match, ...props }) => {
  const { loading, error, data } = useQuery(GET_EMAIL_TEMPLATES)
  if (loading && !data) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  return <EmailTemplates emailTemplates={data?.emailTemplates} />
}

export default EmailTemplatesPage
