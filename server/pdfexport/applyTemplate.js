// const fs = require('fs')
// const path = require('path')
const nunjucks = require('nunjucks')
const cheerio = require('cheerio')
const template = require('./pdfTemplates/article')
const publicationMetadata = require('./pdfTemplates/publicationMetadata')

const fixMathTags = html => {
  const $ = cheerio.load(html)
  $('math-display').replaceWith((index, el) => {
    const content = $(el).html()
    return `<p><span class="math display">$$${content}$$</span></p>`
  })
  $('math-inline').replaceWith((index, el) => {
    const content = $(el).html()
    return `<span class="math inline">$${content}$</span>`
  })
  return $.html()
}

// This is the dist file inside of MathJax
// We are counting on it to be in the same place – if MathJax is updated, it's possible this could break?
// NOTE: this is currently using the remote version of MathJax because that includes fonts. That doesn't break PagedJS
// However: we might want to go back (and figure out how to include fonts) if it turns out that does break PagedJS somewhere.

// const mathjaxfile = require.resolve('mathjax/es5/tex-mml-chtml.js')

// applyTemplate.js

// Separating out the logic to generate output HTML from a template
// so that this could be reused to generate HTML for Flax.
//
// Note that this does not inject CSS into it, though we could be doing that?
// The CSS file is in /pdfTempalates/styles.js

const applyTemplate = articleData => {
  const htmlWithFixedMath = fixMathTags(articleData.meta.source)
  // const mathjax = fs.readFileSync(path.resolve(__dirname, mathjaxfile), 'utf8')
  /* eslint-disable */
  const thisArticle = articleData
  thisArticle.publicationMetadata = publicationMetadata
  thisArticle.meta.source = htmlWithFixedMath
  const preScript = nunjucks.renderString(template, { article: thisArticle })
  // const postScript = preScript.replace(
  //   '<!--<mathjaxscript />-->',
  //   `<script>${mathjax}</script>`,
  // )
  return preScript
  // return postScript
}

module.exports = applyTemplate
