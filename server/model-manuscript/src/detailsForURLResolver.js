const got = require('got')
const cache = require('memory-cache')

const metascraper = require('metascraper')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-logo')(),
  require('metascraper-logo-favicon')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
])

const detailsForURLResolver = async url => {
  const cachedResult = cache.get(url)
  if (cachedResult) return cachedResult

  let data
  try {
    const { body: html } = await got(url)
    data = await metascraper({ url, html })
  } catch (err) {
    data = {}
  }
  cache.put(url, data, 24 * 60 * 60 * 1000)
  return data
}

module.exports = detailsForURLResolver
