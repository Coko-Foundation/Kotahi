const path = require('path')
const fs = require('fs-extra').promises
const nunjucks = require('nunjucks')
const cheerio = require('cheerio')
const publicationMetadata = require('./pdfTemplates/publicationMetadata')
const articleMetadata = require('./pdfTemplates/articleMetadata')

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

// TODO:
// 1. check that articleTemplate.njk mirrors what's in article.js
// 1. Sort out all the different CSSes and make sure that they are being applied correctly
//    ./pdfTemplates/styles.css: this is from Julien & Harshna, used for PDF export
//    /app/componetns/wax-collab/src/layout/EditorElements.js: this exports styles used inside of Wax; some of this should be overwritten.
//			split this into base styles & editor styles
//        for wax: import base styles, then editor styles
//        for production: import base styles, then pagedjs styles

const defaultTemplatePath = path.resolve(__dirname, 'pdfTemplates')

const userTemplatePath = path.resolve(__dirname, '../../config/export')

const generateCss = async () => {
  let outputCss = ''

  const defaultCssBuffer = await fs.readFile(
    `${defaultTemplatePath}/textStyles.css`,
  )

  outputCss += defaultCssBuffer.toString()

  const pagedCssBuffer = await fs.readFile(
    `${defaultTemplatePath}/pagedJsStyles.css`,
  )

  outputCss += pagedCssBuffer.toString()

  try {
    const userCssBuffer = await fs.readFile(
      `${userTemplatePath}/textStyles.css`,
    )

    outputCss += userCssBuffer.toString()
  } catch (e) {
    console.error('No user text stylesheet found', e)
  }

  try {
    const userCssBuffer = await fs.readFile(
      `${userTemplatePath}/pagedJsStyles.css`,
    )

    outputCss += userCssBuffer.toString()
  } catch (e) {
    console.error('No user PagedJS stylesheet found', e)
  }

  return outputCss
}

const defaultTemplateEnv = nunjucks.configure(defaultTemplatePath, {
  autoescape: true,
  cache: false,
})

const userTemplateEnv = nunjucks.configure(userTemplatePath, {
  autoescape: true,
  cache: false,
})

let template = {}

try {
  // If there is a user template, use that instead
  template = userTemplateEnv.getTemplate('article.njk')
} catch (e) {
  template = defaultTemplateEnv.getTemplate('article.njk')
}

const applyTemplate = async (articleData, includeFontLinks) => {
  if (!articleData) {
    // Error handling: if there's no manuscript.meta.source, what should we return?
    return ''
  }

  const thisArticle = articleData
  const htmlWithFixedMath = fixMathTags(articleData.meta.source)
  thisArticle.meta.source = htmlWithFixedMath

  thisArticle.publicationMetadata = publicationMetadata
  thisArticle.articleMetadata = articleMetadata(thisArticle)
  let renderedHtml = nunjucks.renderString(template.tmplStr, {
    article: thisArticle,
  })

  if (includeFontLinks) {
    renderedHtml = renderedHtml.replace(
      '</head>',
      `<link rel="preconnect" href="https://fonts.googleapis.com">
			<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
			<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,300;0,700;1,300;1,700&display=swap" rel="stylesheet">
	</head>`,
    )
  }

  // TODO: why is this coming out over GraphQL with escaped newlines?

  renderedHtml = renderedHtml.replace(/\n|\r|\t/g, '')
  return renderedHtml
}

module.exports = { applyTemplate, generateCss }
