const express = require('express')
const fs = require('fs-extra')
const crypto = require('crypto')
const multer = require('multer')
const passport = require('passport')
const path = require('path')
const config = require('config')
const { createFile, deleteFiles, fileStorage } = require('@coko/server')
const { promisify } = require('util')
const { evictFromCache } = require('../querycache')

const randomBytes = promisify(crypto.randomBytes)

const authBearer = passport.authenticate('bearer', { session: false })

const storage = multer.diskStorage({
  destination: config.get('pubsweet-server').profiles,
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
  limits: { fileSize: 10000000, files: 1 },
})

module.exports = app => {
  // eslint-disable-next-line global-require
  const User = require('../model-user/src/user')
  app.post(
    '/api/uploadProfile',
    authBearer,
    upload.single('file'),
    async (req, res, next) => {
      const user = await User.query()
        .findById(req.user)
        .withGraphFetched('[file]')

      if (user.file) {
        await deleteFiles([user.file.id], true)
      }

      const raw = await randomBytes(16)

      const createdProfilePicture = await createFile(
        fs.createReadStream(`${req.file.path}`),
        `${raw.toString('hex')}${path.extname(req.file.path)}`,
        null,
        null,
        ['profilePicture'],
        user.id,
      )

      const objectKey = createdProfilePicture.storedObjects.find(
        storedObject => storedObject.type === 'small',
      ).key

      evictFromCache(`profilePicFileOfUser:${req.user}`)

      user.profilePicture = await fileStorage.getURL(objectKey)
      await user.save()
      return res.send(user.profilePicture)
    },
  )

  app.use(
    '/profiles',
    express.static(path.join(__dirname, '..', '..', 'profiles')),
  )
}
