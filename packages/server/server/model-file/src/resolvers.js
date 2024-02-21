const crypto = require('crypto')
const { promisify } = require('util')
const fs = require('fs-extra')
const path = require('path')
const config = require('config')
const sharp = require('sharp')
const map = require('lodash/map')
const models = require('@pubsweet/models')

const {
  pubsubManager,
  fileStorage,
  createFile,
  deleteFiles,
  File,
} = require('@coko/server')

const { uniq } = require('lodash')

const {
  getFileWithUrl,
  getFilesWithUrl,
  imageFinder,
} = require('../../utils/fileStorageUtils')

const { FILES_UPLOADED, FILE_UPDATED, FILES_DELETED } = require('./consts')

const randomBytes = promisify(crypto.randomBytes)
const uploadsPath = config.get('pubsweet-server').uploads

/* eslint-disable no-unused-vars */
// direct file upload using fileStorage does not create a entry in database experiment code
const upload = async file => {
  const { createReadStream, filename } = await file
  const stream = createReadStream()

  const storedObjects = await fileStorage.upload(stream, filename)
  const originalFileUrl = await fileStorage.getURL(storedObjects[0].key)

  return originalFileUrl
}

// custom webp conversion experiment code
const createImageVersions = async (buffer, filename) => {
  try {
    const outputWebpPath = path.join(
      uploadsPath,
      `${filename.toString('hex')}.webp`,
    )

    await sharp(buffer).toFile(outputWebpPath)
    return {
      outputWebpPath,
    }
  } catch (e) {
    throw new Error(e)
  }
}

// create custom multiple version experiment code
const uploadFileWithMultipleVersions = async file => {
  const { createReadStream, filename, encoding } = await file
  const stream = createReadStream()
  const raw = await randomBytes(16)
  const generatedFilename = raw.toString('hex') + path.extname(filename)
  const outPath = path.join(uploadsPath, generatedFilename)

  await fs.ensureDir(uploadsPath)
  const outStream = fs.createWriteStream(outPath)
  stream.pipe(outStream, { encoding })

  const tempBuffs = []
  let buffer

  await new Promise((resolve, reject) => {
    stream.on('end', () => {
      buffer = Buffer.concat(tempBuffs)
      resolve()
    })
    stream.on('data', chunk => {
      tempBuffs.push(chunk)
    })
    stream.on('error', reject)
  })

  const localImageVersionPaths = await createImageVersions(buffer, raw)

  const { outputWebpPath } = localImageVersionPaths

  return { originalFilePath: outPath, webpFilePath: outputWebpPath }
}
/* eslint-enable no-unused-vars */

const resolvers = {
  Query: {
    async getEntityFiles(_, { input }) {
      const { entityId, sortingParams, includeInUse = false } = input

      let files = []

      if (sortingParams) {
        const orderByParams = sortingParams.map(option => {
          const { key, order } = option
          return { column: key, order }
        })

        files = await File.query()
          .where({ objectId: entityId })
          .orderBy(orderByParams)
      } else {
        files = await File.query().where({ objectId: entityId })
      }

      const imageFiles = files.filter(file =>
        file.tags.includes('manuscriptImage'),
      )

      if (includeInUse) {
        const manuscript = await models.Manuscript.query().findById(entityId)

        if (manuscript) {
          imageFiles.forEach(file => {
            const foundIn = []
            const { source } = manuscript.meta

            if (source && typeof source === 'string') {
              if (imageFinder(source, file.id)) {
                foundIn.push(manuscript.id)
              }
            }

            // eslint-disable-next-line no-param-reassign
            file.inUse = foundIn.length > 0
          })
        }
      }

      const data = await getFilesWithUrl(imageFiles)
      return data
    },
    async getSpecificFiles(_, { ids }) {
      const files = await File.query().whereIn('id', ids)

      const data = await getFilesWithUrl(files)
      return data
    },
  },
  Mutation: {
    async uploadFile(_, { file }, ctx) {
      const { createReadStream, filename } = await file
      const fileStream = createReadStream()
      const storedObjects = await fileStorage.upload(fileStream, filename)
      storedObjects[0].url = await fileStorage.getURL(storedObjects[0].key)

      const data = {
        name: filename,
        storedObjects,
      }

      return data
    },
    async createFile(_, { file, meta }, ctx) {
      const { createReadStream, filename } = await file
      const fileStream = createReadStream()

      const createdFile = await createFile(
        fileStream,
        filename,
        null,
        null,
        [meta.fileType],
        meta.reviewId || meta.manuscriptId,
      )

      const data = await getFileWithUrl(createdFile)

      return data
    },
    async uploadFiles(_, { files, fileType, entityId }, ctx) {
      const pubsub = await pubsubManager.getPubsub()

      const uploadedFiles = await Promise.all(
        map(files, async file => {
          const { createReadStream, filename } = await file
          const fileStream = createReadStream()

          const createdFile = await createFile(
            fileStream,
            filename,
            filename,
            null,
            [fileType],
            entityId,
          )

          const data = await getFileWithUrl(createdFile)

          return data
        }),
      )

      pubsub.publish(FILES_UPLOADED, {
        filesUploaded: true,
      })

      return uploadedFiles
    },
    async deleteFile(_, { id }, ctx) {
      await deleteFiles([id], true)
      return id
    },
    async deleteFiles(_, { ids }, ctx) {
      const pubsub = await pubsubManager.getPubsub()
      await deleteFiles(ids, true)
      pubsub.publish(FILES_DELETED, {
        filesDeleted: true,
      })
      return ids
    },
    async updateFile(_, { input }, ctx) {
      const { id, name, alt } = input
      const pubsub = await pubsubManager.getPubsub()

      const updatedFile = await File.query().patchAndFetchById(id, {
        name,
        alt,
      })

      pubsub.publish(FILE_UPDATED, {
        fileUpdated: updatedFile,
      })
      return updatedFile
    },
    async updateTagsFile(_, { input }, ctx) {
      const { removeTags, addTags, id } = input

      const file = await File.query().findById(id)
      let updatedTags = file.tags

      if (removeTags) {
        updatedTags = updatedTags.filter(tag => !removeTags.includes(tag))
      }

      if (addTags) {
        updatedTags = uniq(updatedTags.concat(addTags))
      }

      const updatedFile = await File.query().patchAndFetchById(id, {
        tags: updatedTags,
      })

      return updatedFile
    },
  },
  Subscription: {
    filesUploaded: {
      subscribe: async () => {
        const pubsub = await pubsubManager.getPubsub()
        return pubsub.asyncIterator(FILES_UPLOADED)
      },
    },
    filesDeleted: {
      subscribe: async () => {
        const pubsub = await pubsubManager.getPubsub()
        return pubsub.asyncIterator(FILES_DELETED)
      },
    },
    fileUpdated: {
      subscribe: async () => {
        const pubsub = await pubsubManager.getPubsub()
        return pubsub.asyncIterator(FILE_UPDATED)
      },
    },
  },
}

module.exports = resolvers
