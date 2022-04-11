const fs = require('fs')
const path = require('path')
const nunjucks = require('nunjucks')
const template = require('./pdfTemplates/article')
const publicationMetadata = require('./pdfTemplates/publicationMetadata')

require.resolve('mathjax')

// applyTemplate.js

// Separating out the logic to generate output HTML from a template
// so that this could be reused to generate HTML for Flax.
//
// Note that this does not inject CSS into it, though we could be doing that?
// The CSS file is in /pdfTempalates/styles.js

const applyTemplate = articleData => {
  const mathjax = fs.readFileSync(
    path.resolve(__dirname, '/node_modules/mathjax/es5/tex-mml-chtml.js'),
    'utf8',
  )

  /* eslint-disable */
  console.log(mathjax)
  const thisArticle = articleData
  thisArticle.publicationMetadata = publicationMetadata
  thisArticle.mathjax = mathjax
  return nunjucks.renderString(template, { article: thisArticle })
}

module.exports = applyTemplate
