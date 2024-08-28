const axios = require('axios')

const ROR_URL_API = 'https://api.ror.org/'

// Escape Elasticsearch reserved characters
const ELASTICSEARCH_RESERVED_CHARS = [
  '+',
  '-',
  '=',
  '&&',
  '||',
  '>',
  '<',
  '!',
  '(',
  ')',
  '{',
  '}',
  '[',
  ']',
  '^',
  '"',
  '~',
  '*',
  '?',
  ':',
  '\\',
  '/',
]

const encodeSearchQuery = query => {
  let encodedQuery = encodeURIComponent(query)

  ELASTICSEARCH_RESERVED_CHARS.forEach(char => {
    const encodedChar = encodeURIComponent(char)
    encodedQuery = encodedQuery.replace(
      new RegExp(`\\${encodedChar}`, 'g'),
      `\\${encodedChar}`,
    )
  })

  return encodedQuery
}

const searchRor = async input => {
  const encodedQuery = `?query=${encodeSearchQuery(input)}`

  try {
    const response = await axios({
      method: 'get',
      url: `${ROR_URL_API}organizations${encodedQuery}`,
    })

    return response.data.items
  } catch (error) {
    throw new Error(`Error searching ROR: ${error.message}`)
  }
}

module.exports = { searchRor }
