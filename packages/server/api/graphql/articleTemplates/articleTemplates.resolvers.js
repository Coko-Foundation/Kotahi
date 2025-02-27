const {
  getArticleTemplate,
  getTemplateArticle,
  updateTemplate,
  getTemplateFiles,
} = require('../../../controllers/articleTemplates.controllers')

module.exports = {
  Query: {
    articleTemplate: async (_, { groupId, isCms = false }) => {
      return getArticleTemplate(groupId, isCms)
    },
  },
  Mutation: {
    async updateTemplate(_, { id, input }) {
      return updateTemplate(id, input)
    },
  },
  ArticleTemplate: {
    async files(articleTemplate) {
      return getTemplateFiles(articleTemplate)
    },
    async article(articleTemplate) {
      return getTemplateArticle(articleTemplate)
    },
  },
}
