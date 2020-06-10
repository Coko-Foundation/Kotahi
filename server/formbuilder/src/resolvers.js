const config = require('config')
const fs = require('fs')
const { readFiles, mkdirp } = require('./util')
const form = require('../../../app/storage/forms/submit.json')

const writeJson = (path, object) => {
  return fs.writeFileSync(path, JSON.stringify(object, null, 2))
}

const mergeFiles = path =>
  readFiles(path).then(files => {
    const forms = []
    files.forEach((item, index) => {
      const content = JSON.parse(item.content)
      if (!content.name) return
      forms.push(content)
    })
    return { forms }
  })

const resolvers = {
  Mutation: {
    async deleteForms(_, { formId }, ctx) {
      try {
        const folderPath = `${config.get(
          'pubsweet-component-xpub-formbuilder.path',
        )}/`
        const path = `${folderPath}${formId}.json`

        if (fs.existsSync(path)) {
          fs.unlinkSync(path)
        }

        const forms = await mergeFiles(folderPath)

        return forms
      } catch (err) {
        throw new Error(err)
      }
    },
    async deleteFormElement(_, { formId, elementId }, ctx) {
      try {
        const folderPath = `${config.get(
          'pubsweet-component-xpub-formbuilder.path',
        )}/`

        const path = `${folderPath}/${formId}.json`
        const forms = JSON.parse(fs.readFileSync(path, 'utf8'))

        if (forms.children) {
          const children = forms.children.filter(el => el.id !== elementId)
          forms.children = children
          writeJson(path, forms)
        }

        const form = await mergeFiles(folderPath)
        return form
      } catch (err) {
        throw new Error(err)
      }
    },
    async createForm(_, { form }, ctx) {
      try {
        form = JSON.parse(form)
        const folderPath = `${config.get(
          'pubsweet-component-xpub-formbuilder.path',
        )}/`
        const path = `${folderPath}/${form.id}.json`

        if (!fs.existsSync(path)) {
          mkdirp(folderPath)
          writeJson(path, form)
        }

        const forms = await mergeFiles(folderPath)

        return forms
      } catch (err) {
        throw new Error(err)
      }
    },
    async updateForm(_, { form, id }, ctx) {
      // DONE
      form = JSON.parse(form)
      try {
        const folderPath = `${config.get(
          'pubsweet-component-xpub-formbuilder.path',
        )}/`
        let path = `${folderPath}${id}.json`

        if (fs.existsSync(path)) {
          let forms = JSON.parse(fs.readFileSync(path, 'utf8'))
          forms = Object.assign(forms, form)
          form = forms
          if (id !== form.id) {
            fs.unlinkSync(path)
            path = `${folderPath}${form.id}.json`
          }
        }

        writeJson(path, form)

        const forms = await mergeFiles(folderPath)

        return forms
      } catch (err) {
        throw new Error(err)
      }
    },
    async updateFormElements(_, { form, formId }, ctx) {
      // DONE
      const { children } = JSON.parse(form)
      try {
        const folderPath = `${config.get(
          'pubsweet-component-xpub-formbuilder.path',
        )}/`
        const path = `${folderPath}${formId}.json`
        const forms = JSON.parse(fs.readFileSync(path, 'utf8'))
        if (!forms.children) {
          forms.children = [children]
        } else if (forms.children.some(e => e.id === children.id)) {
          const FormChildren = forms.children.map(value =>
            value.id === children.id ? children : value,
          )
          forms.children = FormChildren
        } else {
          forms.children.push(children)
        }

        writeJson(path, forms)
        const form = await mergeFiles(folderPath)
        return form
      } catch (err) {
        throw new Error(err)
      }
    },
  },
  Query: {
    async getFile() {
      return form
    },
    async getForms() {
      try {
        const folderPath = `${config.get(
          'pubsweet-component-xpub-formbuilder.path',
        )}/`

        mkdirp(folderPath)
        const { forms } = await mergeFiles(folderPath)
        return forms
      } catch (err) {
        throw new Error(err)
      }
    },
    async getForm(_, { formId }, ctx) {
      try {
        const folderPath = `${config.get(
          'pubsweet-component-xpub-formbuilder.path',
        )}/`
        const path = `${folderPath}${formId}.json`
        const forms = JSON.parse(fs.readFileSync(path, 'utf8'))

        return forms
      } catch (err) {
        throw new Error(err)
      }
    },
  },
}

module.exports = resolvers
