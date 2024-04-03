/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */
const { difference, map } = require('lodash')
const path = require('path')
const fs = require('fs-extra').promises

const { useTransaction } = require('@coko/server')

const {
  Channel,
  Group,
  Team,
  EmailTemplate,
  ArticleTemplate,
  Config,
} = require('@pubsweet/models')

const seedConfig = require('./seedConfig')
const seedForms = require('./seedForms')
const defaultEmailTemplates = require('../config/defaultEmailTemplates')
const { generateCss } = require('../server/pdfexport/applyTemplate')
const seedArticleTemplate = require('./seedArticleTemplate')

const defaultTemplatePath = path.resolve(
  __dirname,
  '../server/pdfexport/pdfTemplates',
)

const userTemplatePath = path.resolve(__dirname, '../config/journal/export')

const createGroupAndRelatedData = async (
  groupName,
  instanceName,
  index,
  options,
) => {
  const { trx } = options
  const groupExists = await Group.query(trx).findOne({ name: groupName })

  let group = null

  if (groupExists && groupExists.isArchived) {
    // Unarchive group that are added back to INSTANCE_GROUPS
    group = await Group.query(trx).patchAndFetchById(groupExists.id, {
      isArchived: false,
    })

    console.log(
      `  Group "${groupName}" already exists in database and has been unarchived.`,
    )
  } else if (groupExists) {
    group = groupExists
    console.log(`  Group "${groupName}" already exists in database. Skipping.`)
  } else {
    // Seed group when a new entry is added to INSTANCE_GROUPS
    group = await Group.query(trx).insertAndFetch({
      name: groupName,
      isArchived: false,
      type: 'Group',
    })

    console.log(`  Added "${group.name}" group to database.`)
  }

  // Seed config and link it to the created group
  const config = await seedConfig(group, instanceName, index, { trx })

  // Seed forms and link it to the created group
  await seedForms(group, config, { trx })

  await seedArticleTemplate(group, { trx })

  // Seed System-wide discussion channel and link it to the created group
  const channelExists = await Channel.query(trx).findOne({
    topic: 'System-wide discussion',
    type: 'editorial',
    groupId: group.id,
  })

  if (!channelExists) {
    const channel = await Channel.query(trx).insertAndFetch({
      topic: 'System-wide discussion',
      type: 'editorial',
      groupId: group.id,
    })

    console.log(`    Added ${channel.topic} for "${group.name}".`)
  } else {
    console.log(
      `    ${channelExists.topic} already exists in database for "${group.name}". Skipping.`,
    )
  }

  // Seed user role and link it to the created group
  const userTeamExists = await Team.query(trx).findOne({
    role: 'user',
    global: false,
    objectId: group.id,
    objectType: 'Group',
  })

  if (!userTeamExists) {
    const userTeam = await Team.query(trx).insertAndFetch({
      name: 'User',
      role: 'user',
      global: false,
      objectId: group.id,
      objectType: 'Group',
    })

    console.log(`    Added ${userTeam.name} team for "${group.name}".`)
  } else {
    console.log(
      `    ${userTeamExists.name} team already exists in database for "${group.name}". Skipping.`,
    )
  }

  // Seed groupManager role and link it to the created group
  const groupManagerTeamExists = await Team.query(trx).findOne({
    role: 'groupManager',
    global: false,
    objectId: group.id,
    objectType: 'Group',
  })

  if (!groupManagerTeamExists) {
    const groupManagerTeam = await Team.query(trx).insertAndFetch({
      name: 'Group Manager',
      role: 'groupManager',
      global: false,
      objectId: group.id,
      objectType: 'Group',
    })

    console.log(`    Added ${groupManagerTeam.name} team for "${group.name}".`)
  } else {
    console.log(
      `    ${groupManagerTeamExists.name} team already exists in database for "${group.name}". Skipping.`,
    )
  }

  // Seed Group Templates and link it to the created group
  const existingArticleTemplate = await ArticleTemplate.query(trx).where({
    groupId: group.id,
    isCms: false,
  })

  if (existingArticleTemplate.length === 0) {
    const cssTemplate = await generateCss()
    let articleTemplate = ''

    try {
      const userTemplateBuffer = await fs.readFile(
        `${userTemplatePath}/article.njk`,
      )

      articleTemplate += userTemplateBuffer.toString()
    } catch {
      console.error('No user PagedJS stylesheet found')

      const defaultTemplateBuffer = await fs.readFile(
        `${defaultTemplatePath}/article.njk`,
      )

      articleTemplate += defaultTemplateBuffer
    }

    await ArticleTemplate.query(trx).insertGraph({
      article: articleTemplate,
      css: cssTemplate,
      groupId: group.id,
      isCms: false,
    })

    console.log(`Added default group template for "${group.name}".`)
  } else {
    console.log(
      `    ${existingArticleTemplate.length} group templates already exists in database for "${group.name}". Skipping.`,
    )
  }

  // Seed Group Templates and link it to the created group for cms
  const existingCmsArticleTemplate = await ArticleTemplate.query(trx).where({
    groupId: group.id,
    isCms: true,
  })

  if (existingCmsArticleTemplate.length === 0) {
    await ArticleTemplate.query(trx).insertGraph({
      article: '',
      css: '',
      groupId: group.id,
      isCms: true,
    })
  }

  // Seed email templates and link it to the created group
  const existingEmailTemplates = await EmailTemplate.query(trx).where({
    groupId: group.id,
  })

  if (existingEmailTemplates.length === 0) {
    const emailTemplatesData = defaultEmailTemplates
      .map(template => ({
        emailTemplateType: template.type,
        emailContent: {
          subject: template.subject,
          cc: template.cc,
          ccEditors: template.ccEditors,
          body: template.body,
          description: template.description,
        },
        groupId: group.id,
      }))
      .filter(
        template =>
          ![
            'collaboratorAccessRemoved',
            'collaboratorAccessChanged',
            'collaboratorAccessGranted',
          ].includes(template.emailTemplateType) || instanceName === 'lab',
      )

    // Insert default email templates into the database for group
    const insertedEmailTemplates = await EmailTemplate.query(trx).insertGraph(
      emailTemplatesData,
    )

    console.log(
      `    Added ${insertedEmailTemplates.length} number of default email templates for "${group.name}".`,
    )

    // Map default templates to config Event Notification for reviewerInvitation, authorProofingInvitation, authorProofingSubmitted
    const reviewerInvitationEmailTemplate = insertedEmailTemplates.find(
      e =>
        e.groupId === group.id && e.emailTemplateType === 'reviewerInvitation',
    )

    const authorProofingInvitationTemplate = insertedEmailTemplates.find(
      e =>
        e.groupId === group.id &&
        e.emailTemplateType === 'authorProofingInvitation',
    )

    const authorProofingSubmittedTemplate = insertedEmailTemplates.find(
      e =>
        e.groupId === group.id &&
        e.emailTemplateType === 'authorProofingSubmitted',
    )

    const collaboratorAccessGrantedEmailTemplate = insertedEmailTemplates.find(
      e =>
        e.groupId === group.id &&
        e.emailTemplateType === 'collaboratorAccessGranted',
    )

    const collaboratorAccessChangeEmailTemplate = insertedEmailTemplates.find(
      e =>
        e.groupId === group.id &&
        e.emailTemplateType === 'collaboratorAccessChanged',
    )

    const collaboratorAccessRemovedEmailTemplate = insertedEmailTemplates.find(
      e =>
        e.groupId === group.id &&
        e.emailTemplateType === 'collaboratorAccessRemoved',
    )

    const newConfig = config

    newConfig.formData.eventNotification.reviewerInvitationPrimaryEmailTemplate =
      reviewerInvitationEmailTemplate.id
    newConfig.formData.eventNotification.authorProofingInvitationEmailTemplate =
      authorProofingInvitationTemplate.id
    newConfig.formData.eventNotification.authorProofingSubmittedEmailTemplate =
      authorProofingSubmittedTemplate.id

    if (instanceName === 'lab') {
      newConfig.formData.eventNotification.collaboratorAccessGrantedEmailTemplate =
        collaboratorAccessGrantedEmailTemplate.id
      newConfig.formData.eventNotification.collaboratorAccessChangeEmailTemplate =
        collaboratorAccessChangeEmailTemplate.id
      newConfig.formData.eventNotification.collaboratorAccessRemovedEmailTemplate =
        collaboratorAccessRemovedEmailTemplate.id
    }

    await Config.query(trx).updateAndFetchById(config.id, newConfig)

    console.log(
      `    Mapped default email templates in config formdata event notifications.`,
    )
  } else {
    console.log(
      `    ${existingEmailTemplates.length} email templates already exists in database for "${group.name}". Skipping.`,
    )
  }

  // TODO: below @mention notification addition can be moved to default templates and should be done via migration for clean code
  // Check if an email template for @mention notification already exists
  const existingEmailTemplateForMentionNotification = await EmailTemplate.query(
    trx,
  )
    .where({
      group_id: group.id,
      email_template_type: 'systemEmail',
    })
    .andWhereRaw("email_content->>'description' = '@mention notification'")

  if (existingEmailTemplateForMentionNotification.length === 0) {
    const emailTemplatesData = {
      emailTemplateType: 'systemEmail',
      emailContent: {
        description: '@mention notification',
        subject: `Kotahi | {{ senderName }} has mentioned you in a discussion`,
        ccEditors: false,
        body: `<p>
        <p>Dear {{ recipientName }},</p>
        <p>{{ senderName }} mentioned you in a discussion. Click here to reply; {{ discussionUrl }}</p>
        <p>Want to change your notification settings? Login to Kotahi and go to your profile page.</p>
        <p>Regards,<br>
        Kotahi team</p>`,
      },
      groupId: group.id,
    }

    await EmailTemplate.query(trx).insertGraph(emailTemplatesData)

    console.log(
      `    Added @mention notification email template for "${group.name}".`,
    )
  } else {
    console.log(
      `    @mention Notification email template already exists in database for "${group.name}". Skipping.`,
    )
  }

  // update the 'emailTemplateType' value to 'taskNotification' for the task notification email template.
  try {
    await EmailTemplate.query(trx)
      .patch({ emailTemplateType: 'taskNotification' })
      .where({ group_id: group.id })
      .andWhereRaw("email_content->>'subject' = 'Kotahi | Task notification'")

    console.log(
      `Updated email_template_type for the task notification email template.`,
    )
  } catch (error) {
    console.error(
      `Error updating email_template_type for the task notification email template.`,
      error,
    )
  }
}

const group = async () => {
  console.log(`INSTANCE_GROUPS: ${process.env.INSTANCE_GROUPS}`)

  const instanceGroups =
    process.env.INSTANCE_GROUPS &&
    process.env.INSTANCE_GROUPS.split(',')
      .map(g => g.trim())
      .filter(g => !!g)

  console.log(`Number of groups in .env ${instanceGroups.length}`)

  const instanceGroupNames = []

  return useTransaction(async trx => {
    await Promise.all(
      map(instanceGroups, async (instanceGroup, index) => {
        const splittedGroupVariables = instanceGroup && instanceGroup.split(':')
        const groupName = splittedGroupVariables[0]
        const instanceName = splittedGroupVariables[1]
        await createGroupAndRelatedData(groupName, instanceName, index, { trx })
        instanceGroupNames.push(groupName)
      }),
    ).then(async () => {
      let groups = await Group.query(trx)

      const groupNames = groups.map(g => g.name)

      if (instanceGroups.length === groups.length) {
        console.log(`Number of groups in database ${groups.length}`)
      } else {
        // Archive groups that are removed from INSTANCE_GROUPS
        const archiveGroupNames = difference(groupNames, instanceGroupNames)

        const archiveGroupIds = groups
          .filter(g => archiveGroupNames.includes(g.name))
          .map(g => g.id)

        await Group.query(trx).findByIds(archiveGroupIds).patch({
          isArchived: true,
        })

        groups = await Group.query(trx)
        console.log(
          `  Archived groups: "${
            archiveGroupNames.length > 1
              ? archiveGroupNames.join(', ')
              : archiveGroupNames
          }"`,
        )
        console.log(`Number of groups in database ${groups.length}`)
      }
    })
  })
}

module.exports = group
