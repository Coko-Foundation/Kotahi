/* eslint-disable no-console */

const { useTransaction } = require('@coko/server')
const { ArticleTemplate } = require('@pubsweet/models')
const fs = require('fs-extra').promises

// TODO: come up with predefined generic forms based on workflows
const ARTICLE_TEMPLATE_PATH = './config/cmsTemplateFiles/article-preview.njk'

const seed = async (group, options = {}) => {
  return useTransaction(
    async trx => {
      const groupId = group.id

      const existingTemplate = await ArticleTemplate.query(trx).findOne({
        groupId,
        isCms: true,
      })

      if (existingTemplate?.article) {
        console.log(
          `    Group ${group.name} already has a CMS article template. Skipping.`,
        )
        return
      }

      const article = (await fs.readFile(ARTICLE_TEMPLATE_PATH)).toString()

      if (existingTemplate) {
        await ArticleTemplate.query(trx).patchAndFetchById(
          existingTemplate.id,
          {
            article,
          },
        )
        console.log(`    Patched CMS article template for ${group.name}`)
        return
      }

      // Record is missing entirely; create it.
      await ArticleTemplate.query(trx).insert({
        groupId,
        isCms: true,
        article,
        css: '',
      })

      console.log(`    Created CMS article template for ${group.name}`)
    },
    { trx: options.trx },
  )
}

module.exports = seed
