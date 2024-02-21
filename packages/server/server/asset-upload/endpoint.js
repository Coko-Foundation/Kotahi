/* eslint-disable no-await-in-loop */
const fs = require('fs-extra')
const crypto = require('crypto')
const multer = require('multer')
const passport = require('passport')
const path = require('path')
const { createFile, fileStorage, File } = require('@coko/server')
const { getFilesWithUrl } = require('../utils/fileStorageUtils')

const authBearer = passport.authenticate('bearer', { session: false })

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, raw) => {
      if (err) {
        cb(err)
        return
      }

      cb(null, raw.toString('hex') + path.extname(file.originalname))
    })
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10000000, files: 10 },
})

module.exports = app => {
  // eslint-disable-next-line global-require
  const ArticleTemplate = require('../model-article-templates/src/articleTemplate')
  app.post(
    '/api/uploadAsset',
    authBearer,
    upload.array('files'),
    async (req, res, next) => {
      const tags = ['templateGroupAsset']

      if (req.body.isCms === 'true') tags.push('isCms')
      if (req.body.isPdf === 'true') tags.push('isPdf')

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < req.files.length; i++) {
        const insertedFile = await createFile(
          fs.createReadStream(`${req.files[i].path}`),
          req.files[i].originalname,
          null,
          null,
          tags,
          req.body.groupTemplateId,
        )

        if (req.body.fileType === 'javascript' || req.body.fileType === 'css') {
          const file = await File.query().findOne({ id: insertedFile.id })

          if (file.storedObjects) {
            const storedObjects = file.storedObjects.map(storedObject => {
              // eslint-disable-next-line no-param-reassign
              storedObject.mimetype = `text/${req.body.fileType}`
              return storedObject
            })

            await File.query().patchAndFetchById(insertedFile.id, {
              storedObjects,
            })
          }
        }
      }

      return res.send(
        await getFilesWithUrl(
          await ArticleTemplate.relatedQuery('files').for(
            req.body.groupTemplateId,
          ),
        ),
      )
    },
  )

  app.post('/api/deleteAsset', authBearer, async (req, res, next) => {
    // eslint-disable-next-line no-plusplus

    const { id } = req.body
    const file = await File.query().findOne({ id })
    const keys = file.storedObjects.map(f => f.key)

    try {
      if (keys.length > 0) {
        await fileStorage.deleteFiles(keys)
        await File.query().deleteById(id)
      }

      return res.send(
        await getFilesWithUrl(
          await ArticleTemplate.relatedQuery('files').for(file.objectId),
        ),
      )
    } catch (e) {
      throw new Error('The was a problem deleting the file')
    }
  })
}
