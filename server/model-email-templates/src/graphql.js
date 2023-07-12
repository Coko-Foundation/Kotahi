const models = require('@pubsweet/models')

const resolvers = {
  EmailTemplate: {
    emailContent(template) {
      try {
        const {
          cc = '',
          subject = '',
          body = '',
          description = '',
        } = template.emailContent

        return { cc, subject, body, description }
      } catch (error) {
        console.error('Error parsing email template:', template)
        return {
          cc: '',
          subject: '',
          body: '',
          description: '',
        }
      }
    },
  },
  Query: {
    async emailTemplates(_, __, ctx) {
      const groupId = ctx.req.headers['group-id']

      const emailTemplates = await models.EmailTemplate.query().where({
        groupId,
      })

      emailTemplates.sort((a, b) =>
        a.emailContent.description.localeCompare(
          b.emailContent.description,
          undefined,
          { sensitivity: 'base' },
        ),
      )

      return emailTemplates
    },
  },
}

const typeDefs = `
type EmailTemplate {
  id: ID
  created: DateTime!
  updated: DateTime
  emailTemplateType: String
  emailContent: EmailContent!
  groupId: String!
}

type EmailContent {
  cc: String
  subject: String
  body: String
  description: String
  ccEditors: Boolean
}

extend type Query {
  emailTemplates: [EmailTemplate!]
}
`

module.exports = { resolvers, typeDefs }
