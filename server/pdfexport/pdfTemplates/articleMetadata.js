// const fs = require('fs')

// This should return an object with front matter from the form that should be sent to the PDF or to JATS.
// It takes the manuscript as an argument and returns a frontmatter object that can be sentt to the JATS or PDF processor.
// Because every form is different, different users will need to make their own versions of this to suit their needs.

// this should pull in (and be replaced by) a user version from config/journal/exportsettings/articleMetadata.js

// if (!fs.existsSync('../../../config/journal/export/articleMetadata.json')) {
//   // If the file doesn't exist, create one.
//   console.log("User articleMetadata.js doesn't exist, creating one.")
//   fs.writeFileSync(
//     '../../../config/journal/export/articleMetadata.json',
//     `const articleMetadata = {}

// 		module.exports = articleMetadata`,
//   )
// }
let userArticleMetadata = {}

try {
  // eslint-disable-next-line global-require, import/no-unresolved
  userArticleMetadata = require('../../../config/journal/export/articleMetadata.json')
} catch {
  // eslint-disable-next-line no-console
  console.log("userArticleMetadata doesn't exist.")
}

const articleMetadata = manuscript => {
  const meta = {}

  if (manuscript && manuscript.meta && manuscript.meta.manuscriptId) {
    meta.id = manuscript.meta.manuscriptId
  }

  if (manuscript && manuscript.meta && manuscript.meta.title) {
    meta.title = manuscript.meta.title
  }

  if (manuscript && manuscript.created) {
    meta.pubDate = manuscript.created
  }

  if (manuscript && manuscript.submission) {
    meta.submission = manuscript.submission
  }

  if (
    manuscript &&
    manuscript.submission &&
    manuscript.submission.authors &&
    manuscript.submission.authors.length
  ) {
    meta.authors = []

    meta.authors = manuscript.submission.authors.map(author => ({
      email: author.email || '',
      firstName: author.firstName || '',
      lastName: author.lastName || '',
      affiliation: author.affiliation || '',
      id: author.id || '',
    }))
  }

  // replace things by what's in the user version if we need to.

  Object.entries(userArticleMetadata).forEach(([key, value]) => {
    if (value) meta[key] = value
  })

  return meta
}

module.exports = articleMetadata
