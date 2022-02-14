const nunjucks = require('nunjucks')
const template = require('./pdfTemplates/article')
const publicationMetadata = require('./pdfTemplates/publicationMetadata')

// applyTemplate.js

// Separating out the logic to generate output HTML from a template
// so that this could be reused to generate HTML for Flax.
//
// Note that this does not inject CSS into it, though we could be doing that?
// The CSS file is in /pdfTempalates/styles.js

const applyTemplate = articleData => {
  const thisArticle = articleData
  thisArticle.publicationMetadata = publicationMetadata
  return nunjucks.renderString(template, { article: thisArticle })
}

module.exports = applyTemplate
