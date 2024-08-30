const { BaseModel } = require('@coko/server')

class BlacklistEmail extends BaseModel {
  static get tableName() {
    return 'email_blacklist'
  }

  static get schema() {
    return {
      properties: {
        date: {
          anyOf: [
            {
              type: 'string',
              format: 'date-time',
            },
            {
              type: 'object',
            },
            {
              type: 'null',
            },
          ],
        },
        email: {
          type: 'string',
          format: 'email',
        },
        groupId: {
          anyOf: [
            {
              type: 'string',
              format: 'uuid',
            },
            {
              type: 'null',
            },
          ],
        },
      },
    }
  }
}

BlacklistEmail.type = 'BlacklistEmail'
module.exports = BlacklistEmail
