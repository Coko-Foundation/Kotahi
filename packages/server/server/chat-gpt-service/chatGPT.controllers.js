const axios = require('axios')

const Config = require('../../models/config/config.model')

/* eslint-disable-next-line default-param-last */
const chatGPT = async (input, history = [], groupId) => {
  try {
    const CHAT_GPT_URL = 'https://api.openai.com/v1/chat/completions'
    // const CHAT_GPT_URL = config.has('chatGPT.url') && config.get('chatGPT.url')
    const activeConfig = await Config.getCached(groupId)

    const { apiKey } = activeConfig.formData.aiDesignStudio ?? {}

    const CHAT_GPT_KEY = apiKey

    // if (!CHAT_GPT_URL) {
    //   throw new Error('Missing API URL')
    // }

    if (!CHAT_GPT_KEY) {
      throw new Error(
        `Missing access key - ${JSON.stringify(activeConfig.aiDesignStudio)}`,
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
