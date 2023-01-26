const { v4: uuid } = require('uuid')
const models = require('@pubsweet/models')

const upsertArtifact = async artifact => {
  let priorArtifact = null

  if (artifact.externalId)
    priorArtifact = await models.PublishedArtifact.query()
      .select('id')
      .findOne({
        manuscriptId: artifact.manuscriptId,
        externalId: artifact.externalId,
      })

  const artifactId = priorArtifact ? priorArtifact.id : uuid()

  if (priorArtifact)
    await models.PublishedArtifact.query()
      .findById(artifactId)
      .patch({ ...artifact, id: artifactId })
  else
    await models.PublishedArtifact.query().insert({
      ...artifact,
      id: artifactId,
    })

  return artifactId
}

const deleteArtifact = async (manuscriptId, externalId) => {
  await models.PublishedArtifact.query().delete().where({
    manuscriptId,
    externalId,
  })
}

module.exports = { upsertArtifact, deleteArtifact }
