const fs = require('fs')
const path = require('path')
const merge = require('lodash/merge')

const anyStyleResolvers = require('./anyStyle/anyStyle.resolvers')
const articleTemplatesResolvers = require('./articleTemplates/articleTemplates.resolvers')
const channelResolvers = require('./channel/channel.resolvers')
const cmsResolvers = require('./cms/cms.resolvers')
const configResolvers = require('./config/config.resolvers')
const docmapResolvers = require('./docmap/docmap.resolvers')
const emailTemplateResolvers = require('./emailTemplate/emailTemplate.resolvers')
const fileResolvers = require('./file/file.resolvers')
const flaxResolvers = require('./flax/flax.resolvers')
const groupResolvers = require('./group/group.resolvers')
const handlebarsResolvers = require('./handlebars/handlebars.resolvers')
const localContextResolvers = require('./localContext/localContext.resolvers')
const manuscriptResolvers = require('./manuscript/manuscript.resolvers')
const notificationResolvers = require('./notification/notification.resolvers')
const openAiResolvers = require('./openAi/openAi.resolvers')
const orcidResolvers = require('./orcid/orcid.resolvers')
const payloadVerifierResolvers = require('./payloadVerifier/payloadVerifier.resolvers')
const publishedArtifactResolvers = require('./publishedArtifact/publishedArtifact.resolvers')
const rorResolvers = require('./ror/ror.resolvers')
const teamResolvers = require('./team/team.resolvers')

const typeDefFilePaths = [
  'anyStyle/anyStyle.graphql',
  'articleImportHistory/articleImportHistory.graphql',
  'articleImportSources/articleImportSources.graphql',
  'articleTemplates/articleTemplates.graphql',
  'channel/channel.graphql',
  'cms/cms.graphql',
  'config/config.graphql',
  'docmap/docmap.graphql',
  'emailTemplate/emailTemplate.graphql',
  'file/file.graphql',
  'flax/flax.graphql',
  'group/group.graphql',
  'handlebars/handlebars.graphql',
  'localContext/localContext.graphql',
  'manuscript/manuscript.graphql',
  'notification/notification.graphql',
  'openAi/openAi.graphql',
  'orcid/orcid.graphql',
  'payloadVerifier/payloadVerifier.graphql',
  'publishedArtifact/publishedArtifact.graphql',
  'ror/ror.graphql',
  'team/team.graphql',
]

const createTotalTypeDefs = paths => {
  return paths
    .map(p => fs.readFileSync(path.join(__dirname, p), 'utf-8'))
    .join(' ')
}

const typeDefs = createTotalTypeDefs(typeDefFilePaths)

const resolvers = merge(
  {},
  anyStyleResolvers,
  articleTemplatesResolvers,
  channelResolvers,
  cmsResolvers,
  configResolvers,
  docmapResolvers,
  emailTemplateResolvers,
  fileResolvers,
  flaxResolvers,
  groupResolvers,
  handlebarsResolvers,
  localContextResolvers,
  manuscriptResolvers,
  notificationResolvers,
  openAiResolvers,
  orcidResolvers,
  payloadVerifierResolvers,
  publishedArtifactResolvers,
  rorResolvers,
  teamResolvers,
)

module.exports = {
  typeDefs,
  resolvers,
}
