const map = require('lodash/map')
const uniq = require('lodash/uniq')

const { fileStorage, createFile, deleteFiles, File } = require('@coko/server')

const { Manuscript } = require('../models')

const {
  getFileWithUrl,
  getFilesWithUrl,
  imageFinder,
} = require('../utils/fileStorageUtils')

const createFileFn = async (file, meta) => {
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
}

const deleteFile = async id => {
  await deleteFiles([id], true)
  return id
}

const deleteFilesFn = async ids => {
  await deleteFiles(ids, true)
  return ids
}

const getEntityFiles = async input => {
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

  const imageFiles = files.filter(file => file.tags.includes('manuscriptImage'))

  if (includeInUse) {
    const manuscript = await Manuscript.query()
      .findById(entityId)
      .select('id', 'meta')

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
}

const getSpecificFiles = async ids => {
  const files = await File.query().whereIn('id', ids)

  const data = await getFilesWithUrl(files)
  return data
}

const updateFile = async input => {
  const { id, name, alt } = input

  const updatedFile = await File.query().patchAndFetchById(id, {
    name,
    alt,
  })

  return updatedFile
}

const updateTagsFile = async input => {
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
}

const uploadFile = async file => {
  const { createReadStream, filename } = await file
  const fileStream = createReadStream()
  const storedObjects = await fileStorage.upload(fileStream, filename)
  storedObjects[0].url = await fileStorage.getURL(storedObjects[0].key)

  const data = {
    name: filename,
    storedObjects,
  }

  return data
}

const uploadFiles = async (files, fileType, entityId) => {
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

  return uploadedFiles
}

module.exports = {
  createFile: createFileFn,
  deleteFile,
  deleteFiles: deleteFilesFn,
  getEntityFiles,
  getSpecificFiles,
  updateFile,
  updateTagsFile,
  uploadFile,
  uploadFiles,
}
