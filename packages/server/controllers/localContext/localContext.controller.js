/* eslint-disable camelcase */
const axios = require('axios')
const { uuid } = require('@coko/server')
const Config = require('../../models/config/config.model')

const LOCAL_CONTEXT_URL_API = 'https://localcontextshub.org/api/v2/projects/'

const localContext = async ({ projectId, groupId }) => {
  let localContextData = {}
  let errorMessage = null
  let errorCode = null

  try {
    const activeConfig = await Config.getCached(groupId)

    const { apiKey } =
      activeConfig.formData?.integrations?.localContextApiKey ?? {}

    const response = await axios({
      method: 'get',
      url: `${LOCAL_CONTEXT_URL_API}${projectId}`,
      headers: {
        'X-Api-Key': apiKey,
      },
    })

    const { notice, tk_labels, bc_labels } = response.data

    localContextData = {
      id: response.data.unique_id,
      notice: [],
      label: [],
    }

    notice.forEach(n => {
      localContextData.notice.push({
        id: uuid(),
        identifier: 'bc-notice',
        noticeType: n.notice_type,
        name: n.name,
        imgUrl: n.img_url,
        svgUrl: n.svg_url,
        defaultText: n.default_text,
      })
    })

    if (tk_labels.length && tk_labels.length >= 1) {
      tk_labels.forEach(label => {
        localContextData.label.push({
          id: label.unique_id,
          identifier: 'tk-label',
          name: label.name,
          language: label.language,
          languageTag: label.language_tag,
          labelType: label.label_type,
          labelText: label.label_text,
          imgUrl: label.img_url,
          svgUrl: label.svg_url,
        })
      })
    }

    if (bc_labels.length && bc_labels.length >= 1) {
      bc_labels.forEach(label => {
        localContextData.label.push({
          id: label.unique_id,
          identifier: 'bc-label',
          name: label.name,
          language: label.language,
          languageTag: label.language_tag,
          labelType: label.label_type,
          labelText: label.label_text,
          imgUrl: label.img_url,
          svgUrl: label.svg_url,
        })
      })
    }
  } catch (error) {
    errorMessage = error.message
    errorCode = error.response.status
  }

  return { localContext: localContextData, errorMessage, errorCode }
}

module.exports = { localContext }
