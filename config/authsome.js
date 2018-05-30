const { pickBy } = require('lodash')

class XpubCollabraMode {
  /**
   * Creates a new instance of XpubCollabraMode
   *
   * @param {string} userId A user's UUID
   * @param {string} operation The operation you're authorizing for
   * @param {any} object The object of authorization
   * @param {any} context Context for authorization, e.g. database access
   * @returns {string}
   */
  constructor(userId, operation, object, context) {
    this.userId = userId
    this.operation = XpubCollabraMode.mapOperation(operation)
    this.object = object
    this.context = context
  }

  /**
   * Maps operations from HTTP verbs to semantic verbs
   *
   * @param {any} operation
   * @returns {string}
   */
  static mapOperation(operation) {
    const operationMap = {
      GET: 'read',
      POST: 'create',
      PATCH: 'update',
      DELETE: 'delete',
    }

    return operationMap[operation] ? operationMap[operation] : operation
  }

  /**
   * Checks if user is a member of a team of a certain type for a certain object
   *
   * @param {any} user
   * @param {any} teamType
   * @param {any} object
   * @returns {boolean}
   */
  async isTeamMember(teamType, object) {
    if (!this.user || !Array.isArray(this.user.teams)) {
      return false
    }

    let membershipCondition
    if (object) {
      // We're asking if a user is a member of a team for a specific object
      membershipCondition = team =>
        team.teamType === teamType &&
        team.object &&
        team.object.id === object.id
    } else {
      // We're asking if a user is a member of a global team
      membershipCondition = team => team.teamType === teamType && !team.object
    }

    const memberships = await Promise.all(
      this.user.teams.map(async teamId => {
        const team = await this.context.models.Team.find(teamId)

        return membershipCondition(team)
      }),
    )

    return memberships.includes(true)
  }

  /**
   * Returns permissions for unauthenticated users
   *
   * @param {any} operation
   * @param {any} object
   * @returns {boolean}
   */
  unauthenticatedUser(object) {
    return this.operation === 'something public'
  }

  /**
   * Checks if the user is an author, as represented with the owners
   * relationship
   *
   * @param {any} object
   * @returns {boolean}
   */
  isAuthor(object) {
    if (!object || !object.owners || !this.user) {
      return false
    }

    const authorCheck = object.owners.includes(this.user.id)
    if (authorCheck) {
      return true
    }

    return object.owners.some(user => user.id === this.user.id)
  }

  /**
   * Checks if the user is an author, as represented with the owners
   * relationship
   *
   * @returns {boolean}
   */
  isAdmin() {
    return this.user && this.user.admin
  }

  /**
   * Checks if user is a handling editor (member of a team of type handling editor) for an object
   *
   * @returns {boolean}
   */
  isAssignedHandlingEditor(object) {
    return this.isTeamMember('handlingEditor', object)
  }

  /**
   * Checks if user is a senior editor (member of a team of type senior editor) for an object
   *
   * @returns {boolean}
   */
  isAssignedSeniorEditor(object) {
    return this.isTeamMember('seniorEditor', object)
  }

  /**
   * Checks if user is a senior editor (member of a team of type senior editor) for an object
   *
   * @returns {boolean}
   */
  isManagingEditor() {
    return this.isTeamMember('managingEditor')
  }

  /**
   * Checks if user is a reviewer editor (member of a team of type reviewer editor) for an object
   *
   * @returns {boolean}
   */
  isAssignedReviewerEditor(object) {
    return this.isTeamMember('reviewer', object)
  }

  /**
   * Checks if userId is present, indicating an authenticated user
   *
   * @param {any} userId
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.userId
  }

  /**
   * Checks if a user can create a collection.
   *
   * @returns {boolean}
   */
  canCreateCollection() {
    return this.isAuthenticated()
  }

  /**
   * Checks if a user can read a specific collection
   *
   * @returns {boolean}
   *
   */
  async canReadCollection() {
    if (!this.isAuthenticated()) {
      return false
    }

    this.user = await this.context.models.User.find(this.userId)

    if (await this.isManagingEditor()) {
      return true
    }

    const collection = this.object

    let permission = this.checkTeamMembers(
      ['isAssignedSeniorEditor', 'isAssignedHandlingEditor'],
      collection,
    )

    permission = permission
      ? true
      : await this.canReadatLeastOneFragmentOfCollection(collection, [
          'isAssignedReviewerEditor',
        ])

    permission = permission ? true : await this.isAuthor(collection)
    return permission
  }

  async canReadatLeastOneFragmentOfCollection(collection, teamMembers) {
    const permission = await Promise.all(
      collection.fragments.map(async fragmentId =>
        this.checkTeamMembers(teamMembers, { id: fragmentId }),
      ),
    )
    return permission.includes(true)
  }

  /**
   * Checks if a user can list users
   *
   * @returns {boolean}
   */
  async canListUsers() {
    if (!this.isAuthenticated()) {
      return false
    }

    this.user = await this.context.models.User.find(this.userId)

    return true
  }

  /**
   * Checks if a user can read a specific user
   *
   * @returns {boolean}
   */
  async canReadUser() {
    if (!this.isAuthenticated()) {
      return false
    }

    this.user = await this.context.models.User.find(this.userId)

    if (this.user.id === this.object.id) {
      return true
    }
    return {
      filter: user =>
        pickBy(user, (_, key) => ['id', 'username', 'type'].includes(key)),
    }
  }

  /**
   * Checks if a user can read a fragment
   *
   * @returns {boolean}
   */
  async canReadFragment() {
    if (!this.isAuthenticated()) {
      return false
    }

    // Caveat: this means every logged-in user can read every fragment (but needs its UUID)
    // Ideally we'd check if the fragment (version) belongs to a collection (project)
    // where the user is a member of a team with the appropriate rights. However there is no
    // link from a fragment back to a collection at this point. Something to keep in mind!
    return true
  }

  /**
   * Checks if a user can list collections
   *
   * @returns {boolean}
   */
  async canListCollections() {
    if (!this.isAuthenticated()) {
      return false
    }
    this.user = await this.context.models.User.find(this.userId)

    if (await this.isManagingEditor()) {
      return true
    }
    return {
      filter: async collections => {
        const filteredCollections = await Promise.all(
          collections.map(async collection => {
            let condition = await this.checkTeamMembers(
              ['isAssignedSeniorEditor', 'isAssignedHandlingEditor'],
              collection,
            )
            condition = condition
              ? true
              : await this.canReadatLeastOneFragmentOfCollection(collection, [
                  'isAssignedReviewerEditor',
                ])

            condition = condition ? true : await this.isAuthor(collection)
            return condition ? collection : false
          }),
        )

        return filteredCollections.filter(collection => collection)
      },
    }
  }

  /**
   * Checks if a user can create fragments
   *
   * @returns {boolean}
   */
  canCreateFragment() {
    if (!this.isAuthenticated()) {
      return false
    }
    return true
  }

  /**
   * Checks if a user can create a fragment in a specific collection
   *
   * @returns {boolean}
   */
  async canCreateFragmentInACollection() {
    if (!this.isAuthenticated()) {
      return false
    }

    this.user = await this.context.models.User.find(this.userId)

    const { collection } = this.object
    if (collection) {
      const permission =
        this.isAuthor(collection) ||
        (await this.isAssignedHandlingEditor(collection)) ||
        (await this.isAssignedSeniorEditor(collection))

      return permission
    }

    return false
  }

  /**
   * Checks if a user can create a fragment in a specific collection
   *
   * @returns {boolean}
   */
  async canUpdateFragmentInACollection() {
    if (!this.isAuthenticated()) {
      return false
    }

    this.user = await this.context.models.User.find(this.userId)

    const { collection } = this.object
    if (collection) {
      const permission =
        this.isAuthor(collection) ||
        (await this.isAssignedHandlingEditor(collection)) ||
        (await this.isAssignedSeniorEditor(collection)) ||
        (await this.isAssignedReviewerEditor(collection))
      return permission
    }

    return false
  }

  /**
   * Checks if a user can be created
   *
   * @returns {boolean}
   */
  // eslint-disable-next-line
  canCreateUser() {
    return true
  }

  /**
   * Checks if a user can create a team
   *
   * @returns {boolean}
   * @memberof XpubCollabraMode
   */
  async canCreateTeam() {
    if (!this.isAuthenticated()) {
      return false
    }
    this.user = await this.context.models.User.find(this.userId)

    const { teamType, object } = this.object.team
    if (teamType === 'handlingEditor') {
      return this.isAssignedSeniorEditor(object)
    }

    return false
  }

  /**
   * Checks if a user can delete a collection
   *
   * @returns {boolean}
   */
  async canDeleteCollection() {
    this.user = await this.context.models.User.find(this.userId)
    return this.isAuthor(this.object)
  }

  /**
   * Checks if a user can read a team
   *
   * @returns {boolean}
   */
  // eslint-disable-next-line
  async canReadTeam() {
    return true
  }

  /**
   * Checks if a user can list a team
   *
   * @returns {boolean}
   */
  // eslint-disable-next-line
  async canListTeam() {
    return true
  }

  /**
   * Checks if a user can lists team
   *
   * @returns {boolean}
   */
  // eslint-disable-next-line
  async canListTeams() {
    return true
  }

  /**
   * Checks if a user can update a fragment
   *
   * @returns {boolean}
   */
  async canUpdateFragment() {
    this.user = await this.context.models.User.find(this.userId)
    const permission =
      this.isAuthor(this.object) ||
      (await this.isAssignedHandlingEditor(this.object)) ||
      (await this.isAssignedSeniorEditor(this.object)) ||
      (await this.isAssignedReviewerEditor(this.object))
    return permission
  }

  /**
   * Checks if a user can update collection
   *
   * @returns {boolean}
   */
  async canUpdateCollection() {
    this.user = await this.context.models.User.find(this.userId)
    const collection = this.object
    if (collection) {
      return this.checkTeamMembers(
        ['isAuthor', 'isAssignedSeniorEditor', 'isAssignedHandlingEditor'],
        collection,
      )
    }
    return false
  }

  /**
   * Checks if editor can invite Reviewers
   *
   * @returns {boolean}
   */
  async canMakeInvitation() {
    this.user = await this.context.models.User.find(this.userId)
    const { collection } = this.object
    if (collection) {
      return this.checkTeamMembers(
        ['isAssignedSeniorEditor', 'isAssignedHandlingEditor'],
        collection,
      )
    }
    return false
  }

  async canViewMySubmissionSection() {
    this.user = await this.context.models.User.find(this.userId)
    const collection = await Promise.all(
      this.object.map(async collection => this.isAuthor(collection)),
    )
    return collection.some(collection => collection)
  }

  async canViewReviewSection() {
    this.user = await this.context.models.User.find(this.userId)
    const collection = await Promise.all(
      this.object.map(async collection => {
        const permission = await this.canReadatLeastOneFragmentOfCollection(
          collection,
          ['isAssignedReviewerEditor'],
        )
        return permission
      }),
    )
    return collection.some(collection => collection)
  }

  async canViewManuscripts() {
    this.user = await this.context.models.User.find(this.userId)
    const collection = await Promise.all(
      this.object.map(async collection =>
        this.checkTeamMembers(
          ['isAssignedSeniorEditor', 'isAssignedHandlingEditor'],
          collection,
        ),
      ),
    )

    return collection.some(collection => collection)
  }

  async canViewPage() {
    this.user = await this.context.models.User.find(this.userId)
    const { path } = this.object
    if (path === '/projects/:project/versions/:version/submit') {
      // this.checkPageSubmit(params)
      return true
    }

    return true
  }

  checkPageSubmit(params) {
    this.context.models.Collections.find(params.project.id)
    return true
  }

  async checkTeamMembers(team, object) {
    const permission = await Promise.all(team.map(t => this[t](object)))
    return permission.includes(true)
  }
}

module.exports = {
  // This runs before all other authorization queries and is used here
  // to allow admin to do everything
  before: async (userId, operation, object, context) => {
    const user = await context.models.User.find(userId)

    // we need to introduce a new Role Managing Editor
    // currently we take for granted that an admin is the Managing Editor
    // Temporally we need this if statement to prevent admin from seeing
    // review and submission section on dashboard (ME permissions)
    if (
      operation === 'can view review section' ||
      operation === 'can view my submission section'
    )
      return false

    return user.admin
  },
  GET: (userId, operation, object, context) => {
    const mode = new XpubCollabraMode(userId, operation, object, context)
    // GET /api/collections
    if (object && object.path === '/collections') {
      return mode.canListCollections()
    }

    // GET /api/users
    if (object && object.path === '/users') {
      return mode.canListUsers()
    }

    // GET /api/fragments
    if (object && object.path === '/fragments') {
      return mode.canListFragments()
    }

    // GET /api/teams
    if (object && object.path === '/teams') {
      return mode.canListTeams()
    }

    // GET /api/collection
    if (object && object.type === 'collection') {
      return mode.canReadCollection()
    }

    // GET /api/fragment
    if (object && object.type === 'fragment') {
      return mode.canReadFragment()
    }

    // GET /api/team
    if (object && object.type === 'team') {
      return mode.canReadTeam()
    }

    // GET /api/user
    if (object && object.type === 'user') {
      return mode.canReadUser()
    }

    return false
  },
  POST: (userId, operation, object, context) => {
    const mode = new XpubCollabraMode(userId, operation, object, context)

    // POST /api/collections
    if (object && object.path === '/collections') {
      return mode.canCreateCollection()
    }

    // POST /api/users
    if (object && object.path === '/users') {
      return mode.canCreateUser()
    }

    // POST /api/fragments
    if (object && object.path === '/fragments') {
      return mode.canCreateFragment()
    }

    // POST /api/collections/:collectionId/fragments
    if (object && object.path === '/collections/:collectionId/fragments') {
      return mode.canCreateFragmentInACollection()
    }

    // POST /api/teams
    if (object && object.path === '/teams') {
      return mode.canCreateTeam()
    }

    return false
  },
  PATCH: (userId, operation, object, context) => {
    const mode = new XpubCollabraMode(userId, operation, object, context)

    // PATCH /api/make-invitation
    if (object && object.path === '/make-invitation') {
      return mode.canMakeInvitation()
    }

    // PATCH /api/collections/:id
    if (object && object.type === 'collection') {
      return mode.canUpdateCollection()
    }

    // PATCH /api/users/:id
    if (object && object.type === 'user') {
      return mode.canUpdateUser()
    }

    // PATCH /api/fragments/:id
    if (object && object.type === 'fragment') {
      return mode.canUpdateFragment()
    }

    // PATCH /api/teams/:id
    if (object && object.type === 'team') {
      return mode.canUpdateTeam()
    }

    return false
  },
  DELETE: (userId, operation, object, context) => {
    const mode = new XpubCollabraMode(userId, operation, object, context)

    // DELETE /api/collections/:id
    if (object && object.type === 'collection') {
      return mode.canDeleteCollection()
    }

    // DELETE /api/users/:id
    if (object && object.type === 'users') {
      return mode.canDeleteUser()
    }

    // DELETE /api/fragments/:id
    if (object && object.type === 'fragments') {
      return mode.canDeleteFragment()
    }

    // DELETE /api/teams/:id
    if (object && object.type === 'teams') {
      return mode.canDeleteTeam()
    }

    return false
  },
  // Example of a specific authorization query. Notice how easy it is to respond to this.
  'list collections': (userId, operation, object, context) => {
    const mode = new XpubCollabraMode(userId, operation, object, context)
    return mode.canListCollections()
  },
  'can view my submission section': (userId, operation, object, context) => {
    const mode = new XpubCollabraMode(userId, operation, object, context)
    return mode.canViewMySubmissionSection()
  },
  'can view my manuscripts section': (userId, operation, object, context) => {
    const mode = new XpubCollabraMode(userId, operation, object, context)
    return mode.canViewManuscripts()
  },
  'can view review section': (userId, operation, object, context) => {
    const mode = new XpubCollabraMode(userId, operation, object, context)
    return mode.canViewReviewSection()
  },
  'can view page': (userId, operation, object, context) => {
    const mode = new XpubCollabraMode(userId, operation, object, context)
    return mode.canViewPage()
  },
  create: (userId, operation, object, context) => {
    const mode = new XpubCollabraMode(userId, operation, object, context)

    if (object === 'collections' || object.type === 'collection') {
      return mode.canCreateCollection()
    }

    return false
  },
  read: (userId, operation, object, context) => {
    const mode = new XpubCollabraMode(userId, operation, object, context)

    if (object === 'collections') {
      return mode.canListCollections()
    }

    if (object.type === 'collection') {
      return mode.canReadCollection()
    }

    if (object === 'users') {
      return mode.canListUsers()
    }

    if (object.type === 'user') {
      return mode.canReadUser()
    }

    return false
  },
}
