const axios = require('axios')

const ROR_URL_API = 'https://api.ror.org/v2/organizations'

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
      url: `${ROR_URL_API}${encodedQuery}`,
    })

    const items = response.data.items || []

    return items.map(item => ({
      id: item.id,
      name:
        item.names?.find(n => n.types.includes('ror_display'))?.value ||
        item.names?.[0]?.value ||
        item.id,
    }))
  } catch (error) {
    throw new Error(`Error searching ROR: ${error.message}`)
  }
}

module.exports = { searchRor }
