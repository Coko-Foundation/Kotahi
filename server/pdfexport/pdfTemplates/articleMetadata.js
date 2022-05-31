// This should return an object with front matter from the form that should be sent to the PDF or to JATS.
// It takes the manuscript as an argument and returns a frontmatter object that can be sentt to the JATS or PDF processor.
// Because every form is different, different users will need to make their own versions of this to suit their needs.

// this should pull in (and be replaced by) a user version from config/exportsettings/articleMetadata.js

const userArticleMetadata = require('../../../config/export/articleMetadata.js')

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

    for (let i = 0; i < manuscript.submission.authors.length; i += 1) {
      meta.authors[i] = {
        email: manuscript.submission.authors[i].email || '',
        firstName: manuscript.submission.authors[i].firstName || '',
        lastName: manuscript.submission.authors[i].lastName || '',
        affiliation: manuscript.submission.authors[i].affiliation || '',
        id: manuscript.submission.authors[i].id || '',
      }
    }
  }

  // replace things by what's in the user version if we need to.

  const userKeys = Object.keys(userArticleMetadata)

  for (let i = 0; i < userKeys.length; i += 1) {
    if (userArticleMetadata[userKeys]) {
      meta[userKeys] = userArticleMetadata[userKeys]
    }
  }

  return meta
}

module.exports = articleMetadata
