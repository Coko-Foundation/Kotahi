/* eslint-disable no-unused-vars */
const { logger } = require('@coko/server')
const fs = require('fs-extra').promises

/* eslint-disable-next-line import/no-unresolved */
const ArticleTemplate = require('../server/model-article-templates/src/articleTemplate')

exports.up = async () => {
  try {
    const article = await fs.readFile(
      `./config/cmsTemplateFiles/article-preview.njk`,
    )

    await ArticleTemplate.query().patch({ article: article.toString() }).where({
      isCms: true,
    })

    logger.info('default article template content is loaded for cms')
  } catch (error) {
    throw new Error(error)
  }
}
