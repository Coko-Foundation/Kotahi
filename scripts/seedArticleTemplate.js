/* eslint-disable no-console */

const { ArticleTemplate } = require('@pubsweet/models')
const fs = require('fs-extra').promises

// TODO: come up with predefined generic forms based on workflows
const ARTICLE_TEMPLATE_PATH = './config/cmsTemplateFiles/article-preview.njk'

const seed = async group => {
  const groupId = group.id

  const existingTemplate = await ArticleTemplate.query().findOne({
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
    await ArticleTemplate.query().patchAndFetchById(existingTemplate.id, {
      article,
    })
    console.log(`    Patched CMS article template for ${group.name}`)
    return
  }

  // Record is missing entirely; create it.
  await ArticleTemplate.query().insert({
    groupId,
    isCms: true,
    article,
    css: '',
  })
  console.log(`    Created CMS article template for ${group.name}`)
}

module.exports = seed
