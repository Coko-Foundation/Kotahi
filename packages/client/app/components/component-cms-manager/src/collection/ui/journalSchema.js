/* eslint-disable no-unused-vars */
import React from 'react'

const generateSchema = t => {
  const schema = {
    type: 'object',
    title: t('leftMenu.Metadata'),
    properties: {
      title: {
        type: 'string',
        description: t('configPage.title'),
        default: '',
      },
      description: {
        type: 'string',
        description: t('configPage.description'),
        default: '',
      },
      contact: {
        type: 'string',
        description: t('configPage.contact'),
        default: '',
      },
      issn: {
        type: 'string',
        description: t('configPage.issn'),
        default: '',
      },
    },
  }

  const uiSchema = {
    'ui:rootFieldId': 'journalMetadata',
    'ui:submitButtonOptions': { norender: true },
  }

  return { schema, uiSchema }
}

export default generateSchema
