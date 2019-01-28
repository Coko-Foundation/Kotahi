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
        team.object.objectId === object.id
    } else {
      // We're asking if a user is a member of a global team
      membershipCondition = team => team.teamType === teamType && !team.object
    }

    const memberships = await Promise.all(
      this.user.teams.map(async teamId => {
        const id = teamId.id ? teamId.id : teamId
        const team = await this.context.models.Team.find(id)
        if (!team) return [false]

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
   * Checks if the user is an admin, as represented with the owners
   * relationship
   *
   * @returns {boolean}
   */
  isAdmin() {
    return this.user && this.user.admin
  }

  /**
   * Checks if user is a author editor (member of a team of type author) for an object
   *
   * @returns {boolean}
   */
  isAuthor(object) {
    return this.isTeamMember('author', object)
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
  isManagingEditor(object) {
    return this.isTeamMember('managingEditor', object)
  }

  /**
   * Checks if user is a reviewer editor (member of a team of type reviewer editor) for an object
   *
   * @returns {boolean}
   */
  isAssignedReviewerEditor(object) {
    return this.isTeamMember('reviewerEditor', object)
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
  async canReadManuscript() {
    if (!this.isAuthenticated()) {
      return false
    }

    this.user = await this.context.models.User.find(this.userId)

    const manuscript = this.object

    // TODO: Enable more team types
    // if (await this.isManagingEditor(manuscript)) {
    //   return true
    // }

    let permission = await this.checkTeamMembers(
      [
        'isAssignedSeniorEditor',
        'isAssignedHandlingEditor',
        'isAssignedReviewerEditor',
      ],
      manuscript,
    )

    permission = permission ? true : await this.isAuthor(manuscript)

    return permission
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

    this.user = await this.context.models.User.find(this.userId)

    const fragment = this.object
    let permission = this.isAuthor(fragment)

    permission = permission
      ? true
      : await this.isAssignedReviewerEditor(fragment)

    permission = permission
      ? true
      : await this.checkTeamMembers(
          [
            'isAssignedSeniorEditor',
            'isAssignedHandlingEditor',
            'isManagingEditor',
          ],
          { id: fragment.collections[0] },
        )

    // permission = permission
    //   ? true
    //   : await this.isAssignedManagingEditor(fragment)
    // Caveat: this means every logged-in user can read every fragment (but needs its UUID)
    // Ideally we'd check if the fragment (version) belongs to a collection (project)
    // where the user is a member of a team with the appropriate rights. However there is no
    // link from a fragment back to a collection at this point. Something to keep in mind!
    return permission
  }

  /**
   * Checks if a user can list Manuscripts
   *
   * @returns {boolean}
   */
  // async canListManuscripts() {
  //   if (!this.isAuthenticated()) {
  //     return false
  //   }

  //   this.user = await this.context.models.User.find(this.userId)

  //   return {
  //     filter: async manuscripts => {
  //       const filteredManuscripts = await Promise.all(
  //         manuscripts.map(async manuscript => {
  //           let condition = await this.checkTeamMembers(
  //             [
  //               'isAssignedSeniorEditor',
  //               'isAssignedHandlingEditor',
  //               'isManagingEditor',
  //               'isAssignedReviewerEditor',
  //             ],
  //             manuscript,
  //           )
  //           // condition = condition
  //           //   ? true
  //           //   : await this.canReadatLeastOneFragmentOfCollection(collection, [
  //           //       'isAssignedReviewerEditor',
  //           //     ])

  //           condition = condition ? true : await this.isAuthor(manuscript)
  //           return condition ? manuscript : false
  //         }),
  //       )

  //       return filteredManuscripts.filter(manuscript => manuscript)
  //     },
  //   }
  // }

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
      const permission = await this.checkTeamMembers(
        ['isAuthor', 'isAssignedSeniorEditor', 'isAssignedHandlingEditor'],
        collection,
      )
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
   * Checks if a user can lists fragments
   *
   * @returns {boolean}
   */
  // eslint-disable-next-line
  async canListFragments() {
    return true
  }

  /**
   * Checks if a user can update a manuscript
   *
   * @returns {boolean}
   */
  async canUpdateManuscript() {
    const { update, current } = this.object
    this.user = await this.context.models.User.find(this.userId)
    const collection = await this.context.models.Manuscript.find(current.id)

    const schemaEditors = ['decision', 'id', 'reviewers']
    const schemaReviewers = ['id', 'reviewers']

    let permission =
      (await this.isAuthor(current)) && current.status !== 'submitted'

    permission = permission
      ? true
      : (await this.checkTeamMembers(
          ['isAssignedSeniorEditor', 'isAssignedHandlingEditor'],
          collection,
        )) &&
        Object.keys(update).every(value => schemaEditors.indexOf(value) >= 0)

    permission = permission
      ? true
      : (await this.isAssignedReviewerEditor(current)) &&
        Object.keys(update).every(value => schemaReviewers.indexOf(value) >= 0)

    return permission
  }

  /**
   * Checks if a user can update manuscript
   *
   * @returns {boolean}
   */
  // async canUpdateManuscript() {
  //   this.user = await this.context.models.User.find(this.userId)
  //   const { current } = this.object
  //   if (current) {
  //     return this.checkTeamMembers(
  //       ['isAuthor', 'isAssignedSeniorEditor', 'isAssignedHandlingEditor'],
  //       current,
  //     )
  //   }
  //   return false
  // }

  /**
   * Checks if a user can delete Manuscript
   *
   * @returns {boolean}
   */
  async canDeleteManuscript() {
    this.user = await this.context.models.User.find(this.userId)
    const manuscript = this.object

    return this.isAuthor(manuscript) && manuscript.status !== 'submitted'
  }

  /**
   * Checks if editor can invite Reviewers
   *
   * @returns {boolean}
   */
  async canMakeInvitation() {
    this.user = await this.context.models.User.find(this.userId)
    const { current } = this.object
    if (current) {
      return this.checkTeamMembers(
        ['isAssignedSeniorEditor', 'isAssignedHandlingEditor'],
        current,
      )
    }
    return false
  }

  async isAllowedToReview(object) {
    this.user = await this.context.models.User.find(this.userId)
    const permission = await this.isAssignedReviewerEditor({
      id: object.manuscriptId,
    })
    return permission
  }

  async canViewMySubmissionSection() {
    this.user = await this.context.models.User.find(this.userId)
    const manuscripts = await Promise.all(
      this.object.map(async manuscript => this.isAuthor(manuscript)),
    )

    return manuscripts.some(manuscript => manuscript)
  }

  async canViewReviewSection() {
    this.user = await this.context.models.User.find(this.userId)

    const collection = await Promise.all(
      this.object.map(async manuscript => {
        const permission = await this.checkTeamMembers(
          ['isAssignedReviewerEditor'],
          manuscript,
        )

        return permission
      }),
    )
    return collection.some(collection => collection)
  }

  async canViewManuscripts() {
    this.user = await this.context.models.User.find(this.userId)
    const manuscripts = await Promise.all(
      this.object.map(
        async manuscript =>
          (await this.checkTeamMembers(
            ['isAdmin', 'isAssignedSeniorEditor', 'isAssignedHandlingEditor'],
            manuscript,
          )) &&
          (manuscript.status === 'revising' ||
            manuscript.status === 'submitted'),
      ),
    )

    return manuscripts.some(collection => collection)
  }

  async canViewPage() {
    this.user = await this.context.models.User.find(this.userId)
    const { path, params } = this.object

    if (path === '/teams') {
      return !!this.isAdmin()
    }

    if (path === '/journals/:journal/versions/:version/submit') {
      return this.checkPageSubmit(params)
    }

    if (path === '/journals/:journal/versions/:version/reviews/:review') {
      return this.checkPageReviews(params)
    }

    if (
      path === '/journals/:journal/versions/:version/review' ||
      path === '/journals/:journal/versions/:version/reviewers'
    ) {
      return this.checkPageReview(params)
    }

    if (path === '/journals/:journal/versions/:version/decisions/:decision') {
      return this.checkPageDecision(params)
    }

    return true
  }

  async checkPageSubmit(params) {
    const collection = this.context.models.Collection.find(params.project)
    let permission = await this.isAuthor(collection)

    // permission = permission
    //   ? true
    //   : await !this.canReadatLeastOneFragmentOfCollection(collection, [
    //       'isAssignedReviewerEditor',
    //     ])

    permission = permission
      ? true
      : await this.checkTeamMembers(
          [
            'isAssignedSeniorEditor',
            'isAssignedHandlingEditor',
            'isAssignedReviewerEditor',
          ],
          collection,
        )

    return permission
  }

  async checkPageDecision(params) {
    const collection = this.context.models.Collection.find(params.project)

    if (this.isAuthor(collection)) return false

    const permission = await this.checkTeamMembers(
      ['isAssignedSeniorEditor', 'isAssignedHandlingEditor'],
      collection,
    )

    return permission
  }

  async checkPageReviews(params) {
    const fragment = this.context.models.Fragment.find(params.version)

    const permission = await this.checkTeamMembers(
      ['isAssignedReviewerEditor'],
      fragment,
    )

    return permission
  }

  async checkPageReview(params) {
    const collection = this.context.models.Collection.find(params.project)

    const permission = await this.checkTeamMembers(
      ['isAssignedSeniorEditor', 'isAssignedHandlingEditor'],
      collection,
    )

    return permission
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
    if (!userId) return false

    const user = await context.models.User.find(userId)
    if (!user) return false

    // we need to introduce a new Role Managing Editor
    // currently we take for granted that an admin is the Managing Editor
    // Temporally we need this if statement to prevent admin from seeing
    // review and submission section on dashboard (ME permissions)
    // if (
    //   operation === 'can view review section' ||
    //   operation === 'can view my submission section' ||
    //   operation === 'can view my manuscripts section'
    // )
    //   return false
    return user.admin
  },
  create: (userId, operation, object, context) => true,
  update: async (userId, operation, object, context) => {
    const mode = new XpubCollabraMode(userId, operation, object, context)

    if (
      mode.object === 'Manuscript' ||
      mode.object === 'Review' ||
      mode.object === 'Team'
    ) {
      return true
    }

    if (mode.object.current.type === 'team') {
      return true
    }

    if (mode.object.current.type === 'Review') {
      return mode.isAllowedToReview(mode.object.current)
    }

    if (mode.object.current.type === 'Manuscript') {
      return mode.canUpdateManuscript()
    }

    // PATCH /api/users/:id
    if (mode.object.current && mode.object.current.type === 'user') {
      return mode.canUpdateUser()
    }

    return false
  },
  delete: (userId, operation, object, context) => {
    const mode = new XpubCollabraMode(userId, operation, object, context)

    if (object && object.type === 'users') {
      return mode.canDeleteUser()
    }

    if (object === 'Manuscript' || object.type === 'Manuscript') {
      return mode.isAuthor(object)
    }

    if (object === 'Team' || object.type === 'Team') {
      return mode.canDeleteTeam()
    }

    return false
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
  'can delete manuscript': (userId, operation, object, context) => {
    const mode = new XpubCollabraMode(userId, operation, object, context)
    return mode.canDeleteManuscript()
  },
  'can view page': (userId, operation, object, context) => {
    const mode = new XpubCollabraMode(userId, operation, object, context)
    return mode.canViewPage()
  },
  'can view only admin': () => false,
  read: async (userId, operation, object, context) => {
    const mode = new XpubCollabraMode(userId, operation, object, context)

    if (object === 'Manuscript' || object === 'Review') {
      return true
    }

    if (object.type === 'Review') {
      return mode.isAllowedToReview(object)
    }

    if (object.type === 'Manuscript') {
      return mode.canReadManuscript()
    }
    if (object.type === 'team' || object === 'Team') {
      return mode.canReadTeam()
    }

    if (object === 'users') {
      return mode.canListUsers()
    }

    if (object.type === 'user' || object === 'User') {
      return mode.canReadUser()
    }

    return false
  },
}
