/* eslint-disable no-await-in-loop */

const fs = require('fs-extra')

const { createFile, fileStorage, File } = require('@coko/server')

const ArticleTemplate = require('../models/articleTemplate/articleTemplate.model')
const { getFilesWithUrl } = require('../server/utils/fileStorageUtils')

const uploadAsset = async (files, fileType, groupTemplateId, options = {}) => {
  const tags = ['templateGroupAsset']

  if (options.isCms === 'true') tags.push('isCms')
  if (options.isPdf === 'true') tags.push('isPdf')

  for (let i = 0; i < files.length; i += 1) {
    const insertedFile = await createFile(
      fs.createReadStream(`${files[i].path}`),
      files[i].originalname,
      null,
      null,
      tags,
      groupTemplateId,
    )

    if (fileType === 'javascript' || fileType === 'css') {
      const file = await File.query().findOne({ id: insertedFile.id })

      if (file.storedObjects) {
        const storedObjects = file.storedObjects.map(storedObject => {
          // eslint-disable-next-line no-param-reassign
          storedObject.mimetype = `text/${fileType}`
          return storedObject
        })

        await File.query().patchAndFetchById(insertedFile.id, {
          storedObjects,
        })
      }
    }
  }

  const templateFiles = await ArticleTemplate.relatedQuery('files').for(
    groupTemplateId,
  )

  const filesWithUrl = await getFilesWithUrl(templateFiles)
  return filesWithUrl
}

const deleteAsset = async id => {
  const file = await File.findById(id)
  const keys = file.storedObjects.map(f => f.key)

  try {
    if (keys.length > 0) {
      await fileStorage.deleteFiles(keys)
      await File.query().deleteById(id)
    }

    const templateFiles = await ArticleTemplate.relatedQuery('files').for(
      file.objectId,
    )

    const filesWithUrl = await getFilesWithUrl(templateFiles)
    return filesWithUrl
  } catch (e) {
    throw new Error('The was a problem deleting the file')
  }
}

module.exports = { uploadAsset, deleteAsset }
