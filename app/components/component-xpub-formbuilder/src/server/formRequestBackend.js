// const { pick } = require('lodash')
const config = require('config')
const passport = require('passport')
// const logger = require('@pubsweet/logger')
// const User = require('pubsweet-server/src/models/User')
// const authsome = require('pubsweet-server/src/helpers/authsome')
// const AuthorizationError = require('pubsweet-server/src/errors/AuthorizationError')
const fs = require('fs')
// const filepath = require('path')
const { readFiles, mkdirp } = require('./util')

const authBearer = passport.authenticate('bearer', { session: false })

const mergeFiles = path =>
  readFiles(path).then(files => {
    const forms = []
    files.forEach((item, index) => {
      // const { name } = filepath.parse(item.filename)
      const content = JSON.parse(item.content)
      if (!content.name) return
      forms.push(content)
    })
    return { forms }
  })

module.exports = app => {
  app.get('/api/get-forms', authBearer, async (req, res, next) => {
    try {
      const folderPath = `${config.get(
        'pubsweet-component-xpub-formbuilder.path',
      )}/`

      mkdirp(folderPath)
      mergeFiles(folderPath).then(forms =>
        res.send({
          forms,
        }),
      )
    } catch (err) {
      next(err)
    }
  })

  app.get('/api/get-form/:formId', authBearer, async (req, res, next) => {
    try {
      const { formId } = req.params
      const folderPath = `${config.get(
        'pubsweet-component-xpub-formbuilder.path',
      )}/`
      const path = `${folderPath}${formId}.json`
      const forms = JSON.parse(fs.readFileSync(path, 'utf8'))

      res.send({
        forms,
      })
    } catch (err) {
      next(err)
    }
  })

  app.patch(
    '/api/update-forms/:formId/element/:elementId',
    authBearer,
    async (req, res, next) => {
      try {
        const { formId, elementId } = req.params
        const content = req.body
        const folderPath = `${config.get(
          'pubsweet-component-xpub-formbuilder.path',
        )}/`
        const path = `${folderPath}${formId}.json`
        const forms = JSON.parse(fs.readFileSync(path, 'utf8'))
        if (!forms.children) {
          forms.children = [content.children]
        } else if (forms.children.some(e => e.id === elementId)) {
          const children = forms.children.map(value =>
            value.id === elementId ? content.children : value,
          )
          forms.children = children
        } else {
          forms.children.push(content.children)
        }

        fs.writeFileSync(path, JSON.stringify(forms))
        mergeFiles(folderPath).then(forms =>
          res.send({
            forms,
          }),
        )
      } catch (err) {
        next(err)
      }
    },
  )

  app.patch('/api/update-forms/:formId', authBearer, async (req, res, next) => {
    try {
      const { formId } = req.params
      let content = req.body
      const folderPath = `${config.get(
        'pubsweet-component-xpub-formbuilder.path',
      )}/`
      let path = `${folderPath}${formId}.json`

      if (fs.existsSync(path)) {
        let forms = JSON.parse(fs.readFileSync(path, 'utf8'))
        forms = Object.assign(forms, content)
        content = forms
        if (formId !== content.id) {
          fs.unlinkSync(path)
          path = `${folderPath}${content.id}.json`
        }
      }

      fs.writeFileSync(path, JSON.stringify(content))
      mergeFiles(folderPath).then(forms =>
        res.send({
          forms,
        }),
      )
    } catch (err) {
      next(err)
    }
  })

  app.post('/api/create-forms', authBearer, async (req, res, next) => {
    try {
      const content = req.body
      const folderPath = `${config.get(
        'pubsweet-component-xpub-formbuilder.path',
      )}/`
      const path = `${folderPath}/${content.id}.json`

      if (!fs.existsSync(path)) {
        mkdirp(folderPath)
        fs.writeFileSync(path, JSON.stringify(content))
      }

      mergeFiles(folderPath).then(forms =>
        res.send({
          forms,
        }),
      )
    } catch (err) {
      next(err)
    }
  })

  app.delete(
    '/api/delete-forms/:formId/elements/:elementId',
    authBearer,
    async (req, res, next) => {
      try {
        const { formId, elementId } = req.params
        const folderPath = `${config.get(
          'pubsweet-component-xpub-formbuilder.path',
        )}/`

        const path = `${folderPath}/${formId}.json`
        const forms = JSON.parse(fs.readFileSync(path, 'utf8'))

        if (forms.children) {
          const children = forms.children.filter(el => el.id !== elementId)
          forms.children = children
          fs.writeFileSync(path, JSON.stringify(forms))
        }

        mergeFiles(folderPath).then(forms =>
          res.send({
            forms,
          }),
        )
      } catch (err) {
        next(err)
      }
    },
  )

  app.delete(
    '/api/delete-forms/:formId',
    authBearer,
    async (req, res, next) => {
      try {
        const { formId } = req.params
        const folderPath = `${config.get(
          'pubsweet-component-xpub-formbuilder.path',
        )}/`
        const path = `${folderPath}${formId}.json`

        if (fs.existsSync(path)) {
          fs.unlinkSync(path)
        }

        mergeFiles(folderPath).then(forms =>
          res.send({
            forms,
          }),
        )
      } catch (err) {
        next(err)
      }
    },
  )
}
