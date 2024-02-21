const axios = require('axios')

const apiUrl = 'https://api.crossref.org/v1/works'

const getDataByDoi = async doi => {
  try {
    const response = await axios.get(`${apiUrl}/${doi}`, {})

    return response.data.message
  } catch (error) {
    console.error(`Resource not found in crossref for DOI ${doi}`)
    return null
  }
}

const getPublishedDate = data => {
  const { assertion, published } = data
  const publishedDateData = data['published-online'] || published

  const [year, month, date] = publishedDateData
    ? publishedDateData['date-parts'][0].map(String)
    : []

  if (![year, month, date].length) {
    const publish = assertion.find(p => p.name === 'published')
    return publish.value
  }

  return `${date ? `${date}-` : ''}${month ? `${month}-` : ''}${
    year ? `${year}` : ''
  }`
}

const getTopics = data => {
  const subjects = data.subject
  const groupTitle = data['group-title']

  return subjects || [groupTitle]
}

const getJournal = data => {
  const { institution } = data
  const { publisher } = data
  return institution ? institution[0].name : publisher
}

const getAuthor = data => {
  const authors = data.author
  return authors ? authors[0].given : ''
}

const getCrossrefDataViaDoi = async doi => {
  const data = await getDataByDoi(doi)

  if (!data) return null

  const { title, abstract, resource } = data
  const publishedDate = getPublishedDate(data)
  const topics = getTopics(data)
  const journal = getJournal(data)
  const author = getAuthor(data)

  return {
    title: title[0],
    topics,
    publishedDate,
    abstract,
    journal,
    author,
    url: resource?.primary.URL,
  }
}

module.exports = {
  getDataByDoi,
  getCrossrefDataViaDoi,
}
