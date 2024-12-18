const { BaseModel } = require('@coko/server')

const { modelJsonSchemaTypes } = require('@coko/server')

const {
  stringNullable,
  idNullable,
  teamRoles,
  booleanDefaultFalse,
  id,
  stringNotEmpty,
} = modelJsonSchemaTypes

const EmailTemplate = require('../emailTemplate/emailTemplate.model')
const Group = require('../group/group.model')

const eventsSource = require('../../services/notification/eventsSource')

const recipientType = {
  anyOf: [
    { type: 'string', enum: [...teamRoles.enum, 'registeredUser'] },
    { type: 'string', format: 'email' },
  ],
}

const eventsEnum = {
  type: 'string',
  enum: Object.keys(eventsSource),
}

class Notification extends BaseModel {
  static get tableName() {
    return 'notifications'
  }

  static get modifiers() {
    return {
      orderByCreated(builder) {
        builder.orderBy('created', 'desc')
      },
    }
  }

  static get relationMappings() {
    return {
      emailTemplate: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: EmailTemplate,
        join: {
          from: 'notifications.emailTemplateId',
          to: 'email_templates.id',
        },
      },
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'notifications.groupId',
          to: 'groups.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        event: eventsEnum,
        notificationType: { type: 'string', enum: ['email'] },
        groupId: id,
        active: booleanDefaultFalse,
        subject: stringNullable,
        emailTemplateId: idNullable,
        ccEmails: {
          type: 'array',
          items: recipientType,
          default: [],
        },
        isDefault: booleanDefaultFalse,
        displayName: stringNotEmpty,
        recipient: recipientType,
        delay: { type: 'number', default: 0, minimum: 0, maximum: 30 },
      },
      required: [
        'event',
        'notificationType',
        'groupId',
        'displayName',
        'recipient',
      ],
    }
  }
}

Notification.type = 'Notification'
module.exports = Notification
