const express = require('express')
const crypto = require('crypto')
const multer = require('multer')
const passport = require('passport')
const path = require('path')
const config = require('config')
const jimp = require('jimp')

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
  const { User } = require('@pubsweet/models')
  app.post(
    '/api/uploadProfile',
    authBearer,
    upload.single('file'),
    async (req, res, next) => {
      const user = await User.find(req.user)

      const image = await jimp.read(req.file.path)
      await image.cover(200, 200)

      const profilePath = `profiles/${user.username}${path.extname(
        req.file.path,
      )}`
      await image.writeAsync(profilePath)

      user.profilePicture = `/static/${profilePath}`
      await user.save()
      return res.send(user.profilePicture)
    },
  )

  app.use(
    '/static/profiles',
    express.static(path.join(__dirname, '..', '..', 'profiles')),
  )
}
