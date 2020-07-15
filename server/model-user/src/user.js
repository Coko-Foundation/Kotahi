const BaseModel = require('@pubsweet/base-model')
const bcrypt = require('bcrypt')
const pick = require('lodash/pick')
const config = require('config')

const BCRYPT_COST = config.util.getEnv('NODE_ENV') === 'test' ? 1 : 12

class User extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'user'
  }

  $formatJson(json) {
    json = super.$formatJson(json)
    delete json.passwordHash
    return json
  }

  static get tableName() {
    return 'users'
  }

  static get relationMappings() {
    const { Team, TeamMember, Identity } = require('@pubsweet/models')

    return {
      identities: {
        relation: BaseModel.HasManyRelation,
        modelClass: Identity,
        join: {
          from: 'users.id',
          to: 'identities.userId',
        },
      },
      defaultIdentity: {
        relation: BaseModel.HasOneRelation,
        modelClass: Identity,
        join: {
          from: 'users.id',
          to: 'identities.userId',
        },
        filter: builder => {
          builder.where('isDefault', true)
        },
      },
      teams: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Team,
        join: {
          from: 'users.id',
          through: {
            modelClass: TeamMember,
            from: 'team_members.userId',
            to: 'team_members.teamId',
          },
          to: 'teams.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        admin: { type: ['boolean', 'null'] },
        email: { type: ['string', 'null'], format: 'email' },
        username: { type: 'string', pattern: '^[a-zA-Z0-9]+' },
        passwordHash: { type: ['string', 'null'] },
        online: { type: ['boolean', 'null'] },
        passwordResetToken: { type: ['string', 'null'] },
        passwordResetTimestamp: {
          type: ['string', 'object', 'null'],
          format: 'date-time',
        },
        profilePicture: { type: ['string', 'null'] },
      },
    }
  }

  // eslint-disable-next-line class-methods-use-this
  setOwners() {
    // FIXME: this is overriden to be a no-op, because setOwners() is called by
    // the API on create for all entity types and setting `owners` on a User is
    // not allowed. This should instead be solved by having separate code paths
    // in the API for different entity types.
  }

  async save() {
    if (this.password) {
      this.passwordHash = await User.hashPassword(this.password)
      delete this.password
    }

    return super.save()
  }

  async validPassword(password) {
    return password && this.passwordHash
      ? bcrypt.compare(password, this.passwordHash)
      : false
  }

  static hashPassword(password) {
    return bcrypt.hash(password, BCRYPT_COST)
  }

  static findByEmail(email) {
    return this.findByField('email', email).then(users => users[0])
  }

  static findByUsername(username) {
    return this.findByField('username', username).then(users => users[0])
  }

  static async findOneWithIdentity(userId, identityType) {
    const { Identity } = require('@pubsweet/models')
    const user = (
      await this.query()
        .alias('u')
        .leftJoin(
          Identity.query()
            .where('type', identityType)
            .as('i'),
          'u.id',
          'i.userId',
        )
        .where('u.id', userId)
    )[0]

    return user
  }

  // For API display/JSON purposes only
  static ownersWithUsername(object) {
    return Promise.all(
      object.owners.map(async ownerId => {
        const owner = await this.find(ownerId)
        return pick(owner, ['id', 'username'])
      }),
    )
  }
}

User.type = 'user'

module.exports = User
