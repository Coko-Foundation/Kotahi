const path = require('path')
const fs = require('fs-extra').promises
const nunjucks = require('nunjucks')
// const cheerio = require('cheerio')
const publicationMetadata = require('./pdfTemplates/publicationMetadata')
const articleMetadata = require('./pdfTemplates/articleMetadata')
const makeSvgsFromLatex = require('../jatsexport/makeSvgsFromLatex')

// const fixMathTags = html => {
//   const $ = cheerio.load(html)
//   $('math-display').replaceWith((index, el) => {
//     const content = $(el).html()
//     return `<p><span class="math display">$$${content}$$</span></p>`
//   })
//   $('math-inline').replaceWith((index, el) => {
//     const content = $(el).html()
//     return `<span class="math inline">$${content}$</span>`
//   })
//   return $.html()
// }

//  Sort out all the different CSSes and make sure that they are being applied correctly
//    ./pdfTemplates/styles.css: this is from Julien & Harshna, used for PDF export
//    /app/components/wax-collab/src/layout/EditorElements.js: this exports styles used inside of Wax; some of this should be overwritten.
//			split this into base styles & editor styles
//        for wax: import base styles, then editor styles
//        for production: import base styles, then pagedjs styles

const defaultTemplatePath = path.resolve(__dirname, 'pdfTemplates')

const userTemplatePath = path.resolve(__dirname, '../../config/journal/export')

const generateCss = async noPagedJs => {
  // if noPagedJs is true, we don't add the pagedJS styles (this is for the text editor)
  let outputCss = ''

  const defaultCssBuffer = await fs.readFile(
    `${defaultTemplatePath}/textStyles.css`,
  )

  outputCss += defaultCssBuffer.toString()

  try {
    const userCssBuffer = await fs.readFile(
      `${userTemplatePath}/textStyles.css`,
    )

    console.error('Using user-defined text styles.')
    outputCss += userCssBuffer.toString()
  } catch {
    console.error('No user text stylesheet found')
  }

  if (!noPagedJs) {
    try {
      const userCssBuffer = await fs.readFile(
        `${userTemplatePath}/pagedJsStyles.css`,
      )

      console.error('Using user-defined PagedJS styles.')
      outputCss += userCssBuffer.toString()
    } catch {
      console.error('No user PagedJS stylesheet found')

      const pagedCssBuffer = await fs.readFile(
        `${defaultTemplatePath}/pagedJsStyles.css`,
      )

      outputCss += pagedCssBuffer.toString()
    }
  }

  // console.log('textStyles.css: ', outputCss)
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

const applyTemplate = async ({ articleData, groupData }, includeFontLinks) => {
  if (!articleData) {
    // Error handling: if there's no manuscript.meta.source, what should we return?
    return ''
  }

  let template = {}

  try {
    // if there is a group template use that
    if (groupData.article) {
      template.tmplStr = groupData.article.toString()
    } else {
      // If there is a user template, use that instead
      template = userTemplateEnv.getTemplate('article.njk')
    }
  } catch (e) {
    console.error('No user template found, using default')
    template = defaultTemplateEnv.getTemplate('article.njk')
  }

  const thisArticle = articleData
  // const htmlWithFixedMath = fixMathTags(articleData.meta.source)
  // If we're using non-PagedJS MathJax, don't fix math tags, run the code through makeSvgsFromLatex is in pdfExport
  const { svgedSource } = await makeSvgsFromLatex(articleData.meta.source, true)

  thisArticle.meta.source = svgedSource

  thisArticle.publicationMetadata = publicationMetadata
  thisArticle.articleMetadata = articleMetadata(thisArticle)
  // console.log('thisArticle.articleMetadata: ', thisArticle.articleMetadata)

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

  renderedHtml = renderedHtml.replace(/\n|\r|\t/g, '')
  return renderedHtml
}

module.exports = { applyTemplate, generateCss }
