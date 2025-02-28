const {
  createEmailTemplate,
  deleteEmailTemplate,
  emailTemplates,
  templateContent,
  updateEmailTemplate,
} = require('../../../controllers/emailTemplate.controllers')

module.exports = {
  Query: {
    async emailTemplates(_, __, ctx) {
      const groupId = ctx.req.headers['group-id']
      return emailTemplates(groupId)
    },
  },
  Mutation: {
    async createEmailTemplate(_, { input }, ctx) {
      const groupId = ctx.req.headers['group-id']
      return createEmailTemplate(groupId, input)
    },
    async deleteEmailTemplate(_, { id }) {
      return deleteEmailTemplate(id)
    },
    async updateEmailTemplate(_, { input }) {
      return updateEmailTemplate(input)
    },
  },
  EmailTemplate: {
    emailContent(template) {
      return templateContent(template)
    },
  },
}
