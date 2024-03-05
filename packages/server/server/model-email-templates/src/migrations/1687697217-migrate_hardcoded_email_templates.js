/* eslint-disable no-unused-vars */
const { useTransaction, logger } = require('@coko/server')

/* eslint-disable-next-line import/no-unresolved, import/extensions */
const EmailTemplate = require('../server/model-email-templates/src/emailTemplate')
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const TaskEmailNotification = require('../server/model-task/src/taskEmailNotification')
/* eslint-disable-next-line import/no-unresolved, import/extensions */
const TaskEmailNotificationLog = require('../server/model-task/src/taskEmailNotificationLog')

/* eslint-disable-next-line import/no-unresolved */
const existingEmailTemplates =
  /* eslint-disable-next-line import/no-unresolved, import/extensions */
  require('../server/model-email-templates/src/existingEmailTemplates')

exports.up = async knex => {
  try {
    return useTransaction(async trx => {
      // eslint-disable-next-line func-names
      await trx.schema.alterTable(EmailTemplate.tableName, function (table) {
        table.text('email_template_key')
      })
      await trx.schema.alterTable(
        TaskEmailNotification.tableName,
        // eslint-disable-next-line func-names
        function (table) {
          table
            .uuid('email_template_id')
            .nullable()
            .references('id')
            .inTable(EmailTemplate.tableName)
        },
      )
      await trx.schema.alterTable(
        TaskEmailNotificationLog.tableName,
        // eslint-disable-next-line func-names
        function (table) {
          table
            .uuid('email_template_id')
            .nullable()
            .references('id')
            .inTable(EmailTemplate.tableName)

          table.string('email_template_key').nullable().alter()
        },
      )

      const emailTemplatesForInstance = await existingEmailTemplates()

      // Map the emailTemplatesForInstance array to create an array of objects that match the EmailTemplate model structure
      const emailTemplatesData = emailTemplatesForInstance.map(template => ({
        emailTemplateType: template.type,
        emailContent: {
          subject: template.subject,
          cc: template.cc,
          ccEditors: template.ccEditors,
          body: template.body,
          description: template.description,
        },
        emailTemplateKey: template.emailTemplateKey,
      }))

      // Insert email templates into the database
      await EmailTemplate.query(trx).insertGraph(emailTemplatesData)

      try {
        const emailTemplateIds = await EmailTemplate.query(trx)

        const taskEmailNotifications = await TaskEmailNotification.query(
          trx,
        ).whereNotNull('email_template_key')

        // eslint-disable-next-line no-restricted-syntax
        for (const notification of taskEmailNotifications) {
          const emailTemplateId = emailTemplateIds.find(
            template =>
              template.emailTemplateKey === notification.emailTemplateKey,
          )?.id

          // eslint-disable-next-line no-await-in-loop
          await TaskEmailNotification.query(trx)
            .findById(notification.id)
            .patch({
              emailTemplateId,
            })
        }

        // eslint-disable-next-line no-console
        console.info(
          'Email template IDs successfully inserted into task_email_notifications.',
        )
      } catch (error) {
        console.error('Error updating email template IDs:', error)
        throw error
      }

      try {
        const emailTemplateIds = await EmailTemplate.query(trx)
          .select('id')
          .whereIn(
            'email_template_key',
            TaskEmailNotificationLog.query(trx)
              .select('email_template_key')
              .whereNotNull('email_template_key'),
          )

        const taskEmailNotifications = await TaskEmailNotificationLog.query(
          trx,
        ).whereNotNull('email_template_key')

        // eslint-disable-next-line no-restricted-syntax
        for (const notification of taskEmailNotifications) {
          const emailTemplateId = emailTemplateIds.find(
            template =>
              template.emailTemplateKey === notification.emailTemplateKey,
          )?.id

          // eslint-disable-next-line no-await-in-loop
          await TaskEmailNotificationLog.query(trx)
            .findById(notification.id)
            .patch({
              emailTemplateId,
            })
        }

        // eslint-disable-next-line no-console
        console.info(
          'Email template IDs successfully inserted into task_email_notifications.',
        )
      } catch (error) {
        console.error('Error updating email template IDs:', error)
        throw error
      }

      // eslint-disable-next-line func-names
      await trx.schema.alterTable(EmailTemplate.tableName, function (table) {
        table.dropColumn('email_template_key')
      })
    })
  } catch (error) {
    throw new Error(error)
  }
}
