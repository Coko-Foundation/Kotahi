const { useTransaction } = require('@coko/server')
const merge = require('lodash/merge')

const Group = require('../../../models/group/group.model')
const Config = require('../../../models/config/config.model')
const Team = require('../../../models/team/team.model')
const TeamMember = require('../../../models/teamMember/teamMember.model')
const User = require('../../../models/user/user.model')
const Channel = require('../../../models/channel/channel.model')
const Form = require('../../../models/form/form.model')
const Manuscript = require('../../../models/manuscript/manuscript.model')
const seedForms = require('../../../scripts/seedForms')

const GENERIC_USER_COUNT = 5

const ASSIGNABLE_MANUSCRIPT_ROLES = {
  reviewer: 'Reviewers',
  seniorEditor: 'Senior Editor',
  handlingEditor: 'Handling Editor',
  editor: 'Editor',
  managingEditor: 'Managing Editor',
}

// Shared across every test-created group in every suite - created once
// (idempotently) and reused, rather than one throwaway set per group. Treat
// these as read-only identities: only group-scoped data (teams, manuscripts,
// config) should ever be test-specific. Do not mutate a shared user's own
// fields in a test, since that would leak across parallel tests/suites.
const SHARED_USERS = {
  admin: 'pw-admin',
  groupAdmin: 'pw-group-admin',
  groupManager: 'pw-group-manager',
  generic: Array.from(
    { length: GENERIC_USER_COUNT },
    (_, index) => `pw-user-${index + 1}`,
  ),
}

const findOrCreate = async (Model, findQuery, insertData) => {
  const existing = await Model.findOne(findQuery)
  if (existing) return existing

  try {
    return await Model.insert(insertData)
  } catch (err) {
    const existingAfterRace = await Model.findOne(findQuery)
    if (existingAfterRace) return existingAfterRace
    throw err
  }
}

const deleteAllMatching = async (Model, filter, trx) => {
  const { result } = await Model.find(filter, { trx })
  if (result.length === 0) return

  await Model.deleteByIds(
    result.map(row => row.id),
    { trx },
  )
}

const ensureSharedUsers = async () => {
  const adminTeam = await Team.findOne({ global: true, role: 'admin' })

  const ensureUser = async username =>
    findOrCreate(
      User,
      { username },
      { username, email: `${username}@example.com` },
    )

  const [adminUser, groupAdminUser, groupManagerUser, ...genericUsers] =
    await Promise.all([
      ensureUser(SHARED_USERS.admin),
      ensureUser(SHARED_USERS.groupAdmin),
      ensureUser(SHARED_USERS.groupManager),
      ...SHARED_USERS.generic.map(ensureUser),
    ])

  // Add admin user to the admin group
  await findOrCreate(
    TeamMember,
    { userId: adminUser.id, teamId: adminTeam.id },
    { userId: adminUser.id, teamId: adminTeam.id },
  )

  return { adminUser, groupAdminUser, groupManagerUser, genericUsers }
}

const deleteGroupData = async (group, trx) => {
  const { result: manuscripts } = await Manuscript.find(
    { groupId: group.id },
    { trx },
  )

  await Promise.all(
    manuscripts.map(manuscript =>
      deleteAllMatching(Team, { objectId: manuscript.id }, trx),
    ),
  )

  await deleteAllMatching(Manuscript, { groupId: group.id }, trx)
  await deleteAllMatching(Team, { objectId: group.id }, trx)
  await deleteAllMatching(Config, { groupId: group.id }, trx)
  await deleteAllMatching(Channel, { groupId: group.id }, trx)
  await deleteAllMatching(Form, { groupId: group.id }, trx)
  await Group.deleteById(group.id, { trx })
}

const deleteGroup = async groupName =>
  useTransaction(async trx => {
    const group = await Group.findOne({ name: groupName }, { trx })
    if (group) await deleteGroupData(group, trx)
  })

const deleteGroupsByPrefix = async prefix =>
  useTransaction(async trx => {
    const groups = await Group.query(trx).where('name', 'like', `${prefix}%`)

    for (const group of groups) {
      // eslint-disable-next-line no-await-in-loop
      await deleteGroupData(group, trx)
    }

    return { deletedGroups: groups.length }
  })

const createGroup = async groupName => {
  const { adminUser, groupAdminUser, groupManagerUser, genericUsers } =
    await ensureSharedUsers()

  return useTransaction(async trx => {
    // Clear out any leftovers from a previous, interrupted run of this exact
    // group name (e.g. a retried test re-using the same testId).
    const existingGroup = await Group.findOne({ name: groupName }, { trx })
    if (existingGroup) await deleteGroupData(existingGroup, trx)

    const group = await Group.insert(
      { name: groupName, isArchived: false },
      { trx },
    )

    // Mirrors the shape produced by scripts/seedConfig.js's 'journal' case,
    // minus manuscript.tableColumns, so the client's default column fallback
    // can be exercised. Deliberately not a partial/sparse object: several
    // server controllers (e.g. configUtils.js) reach into formData.publishing
    // and friends without full optional chaining, so omitting a branch here
    // can break unrelated requests (e.g. the Groups query) while this config
    // exists.
    const formData = {
      instanceName: 'journal',
      user: { isAdmin: false },
      report: { showInMenu: true },
      review: { showSummary: false },
      dashboard: {
        showSections: ['submission', 'review', 'editor'],
        loginRedirectUrl: '/dashboard',
      },
      manuscript: {
        paginationCount: 10,
      },
      submission: {
        allowAuthorsSubmitNewVersion: false,
        submissionPage: { allowAuthorUploadWithForm: true },
      },
      publishing: {
        hypothesis: {
          group: null,
          apiKey: null,
          shouldAllowTagging: false,
          reverseFieldOrder: false,
        },
        webhook: { ref: null, url: null, token: null },
        crossref: {
          login: null,
          password: null,
          doiPrefix: null,
          registrant: null,
          depositorName: null,
          depositorEmail: null,
          journalHomepage: null,
          publicationType: 'article',
          publishedArticleLocationPrefix: null,
          useSandbox: false,
        },
      },
      production: {
        crossrefRetrievalEmail: '',
        getDataFromDatacite: false,
        fallbackOnCrossrefAfterDatacite: false,
        citationStyles: { styleName: 'apa', localeName: 'en-US' },
        crossrefSearchResultCount: 3,
        manuscriptVersionHistory: { historyIntervalInMinutes: 10 },
      },
      taskManager: { teamTimezone: 'Etc/UTC' },
      controlPanel: {
        showTabs: [
          'Team',
          'Decision',
          'Reviews',
          'Manuscript text',
          'Metadata',
          'Tasks & Notifications',
        ],
        hideReview: false,
        sharedReview: false,
        displayManuscriptShortId: true,
        authorProofingEnabled: false,
        editorsEditReviewsEnabled: false,
        groupManagersCanPublish: true,
        editorsCanPublish: true,
      },
      notification: { eventsConfig: {} },
      eventNotification: {},
      groupIdentity: {
        brandName: groupName,
        primaryColor: '#4a7c59',
        secondaryColor: '#6b7280',
        logoPath: '/logo-kotahi.png',
        title: '',
        description: '',
        contact: '',
        issn: '',
      },
      integrations: {
        kotahiApis: {},
        coarNotify: {},
        aiDesignStudio: {},
        semanticScholar: { enableSemanticScholar: false },
      },
    }

    const config = await Config.insert(
      { groupId: group.id, active: true, formData, type: 'Config' },
      { trx },
    )

    await seedForms(group, config, { trx })

    await Channel.insert(
      {
        topic: 'System-wide discussion',
        type: 'editorial',
        groupId: group.id,
      },
      { trx },
    )

    const [groupAdminTeam, groupManagerTeam, userTeam] = await Promise.all([
      Team.insert(
        {
          displayName: 'Group Admin',
          role: 'groupAdmin',
          global: false,
          objectId: group.id,
          objectType: 'Group',
        },
        { trx },
      ),
      Team.insert(
        {
          displayName: 'Group Manager',
          role: 'groupManager',
          global: false,
          objectId: group.id,
          objectType: 'Group',
        },
        { trx },
      ),
      Team.insert(
        {
          displayName: 'User',
          role: 'user',
          global: false,
          objectId: group.id,
          objectType: 'Group',
        },
        { trx },
      ),
    ])

    await TeamMember.insert(
      [
        { userId: groupAdminUser.id, teamId: groupAdminTeam.id },
        { userId: groupManagerUser.id, teamId: groupManagerTeam.id },
        ...genericUsers.map(genericUser => ({
          userId: genericUser.id,
          teamId: userTeam.id,
        })),
      ],
      { trx },
    )

    return {
      groupName: group.name,
      adminUsername: adminUser.username,
      groupAdminUsername: groupAdminUser.username,
      groupManagerUsername: groupManagerUser.username,
      usernames: genericUsers.map(genericUser => genericUser.username),
    }
  })
}

const createManuscripts = async ({ groupName, count, submitterUsername }) => {
  const group = await Group.findOne({ name: groupName })

  if (!group) {
    throw new Error(`No group found named "${groupName}"`)
  }

  const submitterUsernames = submitterUsername
    ? [submitterUsername]
    : SHARED_USERS.generic

  const submitters = (
    await Promise.all(
      submitterUsernames.map(username => User.findOne({ username })),
    )
  ).filter(Boolean)

  if (submitters.length === 0) {
    throw new Error(
      `No users found to use as submitters for group "${groupName}"`,
    )
  }

  return useTransaction(async trx => {
    const manuscripts = await Manuscript.insert(
      Array.from({ length: count }, (_, index) => ({
        groupId: group.id,
        submitterId: submitters[index % submitters.length].id,
        status: 'new',
        submission: {
          $title: `Test manuscript ${index + 1}`,
          $abstract: `Abstract for test manuscript ${index + 1}`,
        },
      })),
      { trx },
    )

    await Promise.all(
      manuscripts.map(async (manuscript, index) => {
        const authorTeam = await Team.insert(
          {
            displayName: 'Author',
            role: 'author',
            global: false,
            objectId: manuscript.id,
            objectType: 'manuscript',
          },
          { trx },
        )

        await TeamMember.insert(
          {
            userId: submitters[index % submitters.length].id,
            teamId: authorTeam.id,
          },
          { trx },
        )

        await Promise.all(
          Object.entries(ASSIGNABLE_MANUSCRIPT_ROLES).map(
            ([role, displayName]) =>
              Team.insert(
                {
                  displayName,
                  role,
                  global: false,
                  objectId: manuscript.id,
                  objectType: 'manuscript',
                },
                { trx },
              ),
          ),
        )
      }),
    )

    return { manuscriptIds: manuscripts.map(manuscript => manuscript.id) }
  })
}

const assignRole = async ({ manuscriptIds, username, role }) => {
  if (!ASSIGNABLE_MANUSCRIPT_ROLES[role]) {
    throw new Error(`"${role}" is not an assignable manuscript role`)
  }

  const user = await User.findOne({ username })

  if (!user) {
    throw new Error(`No user found named "${username}"`)
  }

  return useTransaction(async trx => {
    await Promise.all(
      manuscriptIds.map(async manuscriptId => {
        const team = await Team.findOne(
          { objectId: manuscriptId, role },
          { trx },
        )

        if (!team) {
          throw new Error(
            `No "${role}" team found for manuscript "${manuscriptId}"`,
          )
        }

        await TeamMember.insert({ userId: user.id, teamId: team.id }, { trx })
      }),
    )

    return { manuscriptCount: manuscriptIds.length }
  })
}

const updateGroupConfig = async ({ groupName, patch }) => {
  const group = await Group.findOne({ name: groupName })

  if (!group) {
    throw new Error(`No group found named "${groupName}"`)
  }

  const config = await Config.findOne({ groupId: group.id, active: true })

  if (!config) {
    throw new Error(`No active config found for group "${groupName}"`)
  }

  const formData = merge({}, config.formData, patch)

  return Config.patchAndFetchById(config.id, { formData })
}

// Deletes the shared pw-* users (and, via cascade, their team memberships).
// Not part of deleteGroup(sByPrefix) - these users aren't owned by any one
// group, so cleaning them up is a separate step, meant to run once at the
// very end of a whole test run (see globalTeardown.ts), not per-group.
const deleteSharedUsers = async () => {
  const usernames = [
    SHARED_USERS.admin,
    SHARED_USERS.groupAdmin,
    SHARED_USERS.groupManager,
    ...SHARED_USERS.generic,
  ]

  const users = (
    await Promise.all(usernames.map(username => User.findOne({ username })))
  ).filter(Boolean)

  if (users.length === 0) return { deletedUsers: 0 }

  await User.deleteByIds(users.map(user => user.id))

  return { deletedUsers: users.length }
}

module.exports = {
  createGroup,
  deleteGroup,
  deleteGroupsByPrefix,
  createManuscripts,
  assignRole,
  updateGroupConfig,
  deleteSharedUsers,
}
