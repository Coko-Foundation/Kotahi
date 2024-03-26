const axios = require('axios')
const models = require('@pubsweet/models')

// const logger = require('@coko/server')

const chatGPT = async (input, history = [], groupId) => {
  try {
    const CHAT_GPT_URL = 'https://api.openai.com/v1/chat/completions'
    // const CHAT_GPT_URL = config.has('chatGPT.url') && config.get('chatGPT.url')
    const activeConfig = await models.Config.getCached(groupId)

    const { apiKey } = activeConfig.formData.openAi ?? {}

    const CHAT_GPT_KEY = apiKey

    // if (!CHAT_GPT_URL) {
    //   throw new Error('Missing API URL')
    // }

    if (!CHAT_GPT_KEY) {
      throw new Error(
        `Missing access key - ${JSON.stringify(activeConfig.openAi)}`,
      )
    }

    const response = await axios.post(
      CHAT_GPT_URL,
      {
        model: 'gpt-4-1106-preview',
        messages: [
          ...history,
          {
            role: 'user',
            content: input,
          },
        ],
        temperature: 0,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${CHAT_GPT_KEY}`,
        },
      },
    )

    return JSON.stringify(response.data.choices[0])
  } catch (e) {
    console.error('chatGPT:', e)
    throw new Error(e)
  }
}

module.exports = chatGPT
