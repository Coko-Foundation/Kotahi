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
          ccEditors = false,
        } = template.emailContent

        return { cc, subject, body, description, ccEditors }
      } catch (error) {
        console.error('Error parsing email template:', template)
        return {
          cc: '',
          subject: '',
          body: '',
          description: '',
          ccEditors: false,
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
  Mutation: {
    async createEmailTemplate(_, { input }, ctx) {
      try {
        const groupId = ctx.req.headers['group-id']

        const emailContents = {
          body: input.emailContent.body || '',
          subject: input.emailContent.subject || '',
          cc: input.emailContent.cc || '',
          description: input.emailContent.description || '',
          ccEditors: input.emailContent.ccEditors,
        }

        const newEmailTemplate = new models.EmailTemplate({
          emailContent: emailContents,
          groupId,
        })

        const createdEmailTemplate = await newEmailTemplate.save()

        return {
          success: true,
          error: null,
          emailTemplate: createdEmailTemplate,
        }
      } catch (error) {
        console.error('Error creating email template:', error)
        return { success: false, error: 'Something went wrong.' }
      }
    },
    async deleteEmailTemplate(_, { id }, ctx) {
      try {
        await models.TaskEmailNotification.query()
          .where('email_template_id', id)
          .delete()

        const response = await models.EmailTemplate.query()
          .where({ id })
          .delete()

        if (response) {
          return {
            success: true,
          }
        }

        return {
          success: false,
          error: `Something went wrong`,
        }
      } catch (err) {
        return {
          success: false,
          error: `Something went wrong. ${err.message}`,
        }
      }
    },
    async updateEmailTemplate(_, { input }, ctx) {
      try {
        // Update the EmailTemplate in the database based on the provided ID and input
        const updatedEmailTemplate = await models.EmailTemplate.query().updateAndFetchById(
          input.id,
          {
            emailContent: {
              cc: input.emailContent.cc,
              subject: input.emailContent.subject,
              body: input.emailContent.body,
              description: input.emailContent.description,
              ccEditors: input.emailContent.ccEditors,
            },
          },
        )

        if (updatedEmailTemplate) {
          return {
            success: true,
            error: null,
            emailTemplate: updatedEmailTemplate,
          }
        }

        return {
          success: false,
          error: 'Email template not found.',
          emailContent: null,
        }
      } catch (error) {
        // Handle any errors that occurred during the update process
        console.error('Error updating email template:', error)
        return {
          success: false,
          error: 'Internal server error.',
          emailContent: null,
        }
      }
    },
  },
}

const typeDefs = `
type EmailTemplate {
  id: ID!
  created: DateTime!
  updated: DateTime
  emailTemplateType: String
  emailContent: EmailContent!
  groupId: ID!
}

type EmailContent {
  cc: String
  subject: String!
  body: String!
  description: String!
  ccEditors: Boolean!
}

input EmailContentInput {
  cc: String
  subject: String!
  body: String!
  description: String!
  ccEditors: Boolean!
}

input EmailTemplateInput {
  id: ID
  emailTemplateType: String
  emailContent: EmailContentInput!
  groupId: ID
}

type EmailTemplateResponse {
  emailTemplate: EmailTemplate
  success: Boolean!
  error: String
}

extend type Query {
  emailTemplates: [EmailTemplate!]!
}

extend type Mutation {
  createEmailTemplate(input: EmailTemplateInput!): EmailTemplateResponse!
  deleteEmailTemplate(id: ID!): EmailTemplateResponse!
  updateEmailTemplate(input: EmailTemplateInput!): EmailTemplateResponse!
}
`

module.exports = { resolvers, typeDefs }
