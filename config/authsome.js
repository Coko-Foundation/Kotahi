const { pickBy } = require('lodash')

const objType = obj => (obj.constructor && obj.constructor.name) || obj.type

class AuthsomeMode {
  /**
   * Creates a new instance of AuthsomeMode
   *
   * @param {string} userId A user's UUID
   * @param {string} operation The operation you're authorizing for
   * @param {any} object The object of authorization
   * @param {any} context Context for authorization, e.g. database access
   * @returns {string}
   */
  constructor(userId, operation, object, context) {
    this.userId = userId
    this.operation = operation
    this.object = object
    this.context = context
  }

  /**
   * Checks if user is a member of a team of a certain type for a certain object
   *
   * @param {any} role
   * @param {any} object
   * @returns {boolean}
   */
  async isTeamMember(role, object) {
    if (!this.user) {
      return false
    }

    this.user.teams =
      this.user.teams ||
      (
        await this.context.models.User.query()
          .findById(this.user.id)
          .eager('teams')
      ).teams

    let membershipCondition

    if (object) {
      // We're asking if a user is a member of a team for a specific object
      membershipCondition = team => {
        const { objectId } = team
        return team.role === role && objectId === object.id
      }
    } else {
      // We're asking if a user is a member of a global team
      membershipCondition = team => team.role === role && team.global
    }

    const memberships = await Promise.all(
      this.user.teams.map(async team => {
        if (!team) return false

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
   * Checks if the user is an admin
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
   * Checks if user is an editor (any editor) globally
   *
   * @returns {boolean}
   */
  async isGlobalEditor(object) {
    const seniorEditor = await this.isTeamMember('seniorEditor')
    const handlingEditor = await this.isTeamMember('handlingEditor')

    return seniorEditor || handlingEditor
  }

  /**
   * Checks if user is a reviewer (member of a team of type reviewer) for an object
   *
   * @returns {boolean}
   */
  isAssignedReviewer(object) {
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
   * Checks if a user can read a specific collection
   *
   * @returns {boolean}
   *
   */
  async canReadManuscript() {
    if (!this.isAuthenticated()) {
      return false
    }

    this.user = await getUserAndTeams(this.userId, this.context)

    const manuscript = this.object

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

    this.user = await getUserAndTeams(this.userId, this.context)

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

    this.user = await getUserAndTeams(this.userId, this.context)

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

    this.user = await getUserAndTeams(this.userId, this.context)

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

    return permission
  }

  /**
   * Checks if a user can list Manuscripts
   *
   * @returns {boolean}
   */
  async canListManuscripts() {
    if (!this.isAuthenticated()) {
      return false
    }

    this.user = await getUserAndTeams(this.userId, this.context)

    return {
      filter: async manuscripts => {
        const filteredManuscripts = await Promise.all(
          manuscripts.map(async manuscript => {
            let condition = await this.checkTeamMembers(
              [
                'isAssignedSeniorEditor',
                'isAssignedHandlingEditor',
                'isManagingEditor',
                'isAssignedReviewerEditor',
              ],
              manuscript,
            )
            // condition = condition
            //   ? true
            //   : await this.canReadatLeastOneFragmentOfCollection(collection, [
            //       'isAssignedReviewerEditor',
            //     ])

            condition = condition ? true : await this.isAuthor(manuscript)
            return condition ? manuscript : false
          }),
        )

        return filteredManuscripts.filter(manuscript => manuscript)
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

    this.user = await getUserAndTeams(this.userId, this.context)

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

    this.user = await getUserAndTeams(this.userId, this.context)

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
   * @memberof AuthsomeMode
   */
  async canCreateTeam() {
    if (!this.isAuthenticated()) {
      return false
    }

    this.user = await getUserAndTeams(this.userId, this.context)

    const { role, object } = this.object.team

    if (role === 'handlingEditor') {
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
    this.user = await getUserAndTeams(this.userId, this.context)
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
   * Checks if a user can delete Manuscript
   *
   * @returns {boolean}
   */
  async canDeleteManuscript() {
    this.user = await getUserAndTeams(this.userId, this.context)
    const manuscript = this.object

    return this.isAuthor(manuscript) && manuscript.status !== 'submitted'
  }

  /**
   * Checks if editor can invite Reviewers
   *
   * @returns {boolean}
   */
  async canMakeInvitation() {
    this.user = await getUserAndTeams(this.userId, this.context)
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
    this.user = await getUserAndTeams(this.userId, this.context)

    return this.checkTeamMembers(
      [
        'isAssignedSeniorEditor',
        'isAssignedHandlingEditor',
        'isAssignedReviewerEditor',
      ],
      { id: object.manuscriptId },
    )
  }

  async canViewManuscripts() {
    this.user = await getUserAndTeams(this.userId, this.context)

    const manuscripts = await Promise.all(
      this.object.map(
        async manuscript =>
          (await this.checkTeamMembers(
            ['isAdmin', 'isAssignedSeniorEditor', 'isAssignedHandlingEditor'],
            manuscript,
          )) &&
          (manuscript.status === 'revising' ||
            manuscript.status === 'submitted' ||
            manuscript.status === 'accepted'),
      ),
    )

    return manuscripts.some(m => m)
  }
}

const getUserAndTeams = async (userId, context) => {
  const user = await context.models.User.find(userId)
  if (!user) return false
  // If it runs on the client, it will have teams in there already.
  // On the server, we need to add the team ids.

  if (!user.teams && user.$relatedQuery) {
    user.teams = (await user.$relatedQuery('teams')).map(team => team.id)
  }

  return user
}

module.exports = {
  // This runs before all other authorization queries and is used here
  // to allow admin to do everything
  before: async (userId, operation, object, context) => {
    if (!userId) return false

    const user = await getUserAndTeams(userId, context)
    if (!user) return false

    return user.admin
  },
  create: (userId, operation, object, context) => true,
  update: async (userId, operation, object, context) => {
    const mode = new AuthsomeMode(userId, operation, object, context)

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
    const mode = new AuthsomeMode(userId, operation, object, context)

    if (object && objType(object) === 'users') {
      return mode.canDeleteUser()
    }

    if (object === 'Manuscript' || objType(object) === 'Manuscript') {
      return mode.isAuthor(object)
    }

    if (object === 'Team' || objType(object) === 'Team') {
      return true
      // return mode.canDeleteTeam()
    }

    return false
  },
  read: async (userId, operation, object, context) => {
    const mode = new AuthsomeMode(userId, operation, object, context)

    // Can a user read (list) Manuscripts or Reviews?
    if (object === 'Manuscript' || object === 'Review') {
      return true
    }

    // Can a user read a specific Review?
    if (objType(object) === 'Review') {
      return mode.isAllowedToReview(object)
    }

    // Can a user read a specific Manuscript?
    if (objType(object) === 'Manuscript') {
      return mode.canReadManuscript()
    }

    // Can a user read
    if (objType(object) === 'team' || object === 'Team') {
      return mode.canReadTeam()
    }

    if (object.constructor.name === 'TeamMember') {
      return true
    }

    if (object === 'users') {
      return mode.canListUsers()
    }

    if (objType(object) === 'user' || object === 'User') {
      return mode.canReadUser()
    }

    return false
  },
}
