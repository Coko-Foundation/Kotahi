/* eslint-disable no-await-in-loop */
const fs = require('fs-extra')
const crypto = require('crypto')
const multer = require('multer')
const passport = require('passport')
const path = require('path')
const { createFile } = require('@coko/server')

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
  const CMSFileTemplate = require('../model-cms/src/cmsFileTemplate')
  app.post(
    '/api/cmsUploadFiles',
    authBearer,
    upload.array('files'),
    async (req, res, next) => {
      const { id } = req.body
      const folder = await CMSFileTemplate.query().findOne({ id })
      const uploadedFiles = []

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < req.files.length; i++) {
        const insertedResource = await CMSFileTemplate.query()
          .insertGraph({
            name: req.files[i].originalname,
            parentId: folder.id,
            groupId: folder.groupId,
          })
          .returning('id')

        const insertedFile = await createFile(
          fs.createReadStream(`${req.files[i].path}`),
          req.files[i].originalname,
          null,
          null,
          ['cmsTemplateFile'],
          insertedResource.id,
        )

        uploadedFiles.push(
          await CMSFileTemplate.query()
            .update({ fileId: insertedFile.id })
            .where({ id: insertedResource.id })
            .returning('*'),
        )
      }

      return res.send(uploadedFiles)
    },
  )
}
