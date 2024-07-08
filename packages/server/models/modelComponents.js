/**
 * For use by config/components.js
 */

const modelPaths = [
  'alias',
  'articleImportHistory',
  'articleImportSources',
  'articleTemplate',
  'blacklistEmail',
  'channel',
  'channelMember',
  'cmsFileTemplate',
  'cmsLayout',
  'cmsPage',
  'coarNotification',
  'config',
  'docmap',
  'emailTemplate',
  'file',
  'form',
  'group',
  'identity',
  'invitation',
  'manuscript',
  'message',
  'notificationDigest',
  'notificationUserOption',
  'publishedArtifact',
  'publishingCollection',
  'review',
  'task',
  'taskAlert',
  'taskEmailNotification',
  'taskEmailNotificationLog',
  'team',
  'teamMember',
  'threadedDiscussion',
  'user',
  'collaborative-doc',
].map(name => `./models/${name}`)

module.exports = modelPaths
