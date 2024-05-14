/* eslint-disable no-await-in-loop */
const fs = require('fs')
const path = require('path')

const { createFile } = require('@coko/server')

const {
  connectToFileStorage,
} = require('@coko/server/src/services/fileStorage')

const CMSFileTemplate = require('../models/cmsFileTemplate/cmsFileTemplate.model')

const readDirectoryRecursively = async (directoryPath, parentId, callBack) => {
  const files = fs.readdirSync(directoryPath)

  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    const filePath = path.join(directoryPath, file)
    const stats = fs.statSync(filePath)

    if (stats.isDirectory()) {
      const insertedDirectoryId = await callBack(
        filePath,
        parentId,
        false,
        true,
      )

      // It's a directory, so recursively read its contents
      await readDirectoryRecursively(filePath, insertedDirectoryId, callBack)
    } else {
      // It's a file, you can perform operations on the file here
      await callBack(filePath, parentId, false, false)
    }
  }
}

const seed = async (group, { trx }) => {
  await connectToFileStorage()

  const insertResource = async (name, parentId, rootFolder, isDirectory) => {
    const insertedResource = await CMSFileTemplate.query(trx)
      .insertGraph({
        name: path.basename(name),
        parentId,
        groupId: group.id,
        rootFolder, // set default true for the root of the group folder
      })
      .returning('id')

    if (!isDirectory) {
      const insertedFile = await createFile(
        fs.createReadStream(name),
        path.basename(name),
        null,
        null,
        ['cmsTemplateFile'],
        insertedResource.id,
        { trx },
      )

      await CMSFileTemplate.query(trx)
        .update({ fileId: insertedFile.id })
        .where({ id: insertedResource.id })
    }

    return insertedResource.id
  }

  const existFolder = await CMSFileTemplate.query(trx).findOne({
    name: group.name,
    groupId: group.id,
  })

  if (!existFolder) {
    const insertedRootFolderId = await insertResource(
      'Cms Files',
      null,
      false,
      true,
    )

    const insertedFolderId = await insertResource(
      group.name,
      insertedRootFolderId,
      true,
      true,
    )

    await readDirectoryRecursively(
      /* eslint-disable-next-line node/no-path-concat */
      `${__dirname}/../config/cmsTemplateFiles`,
      insertedFolderId,
      insertResource,
    )
  }
}

module.exports = seed
