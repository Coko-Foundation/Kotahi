const config = require('config')
const fs = require('fs')
const path = require('path')
const { readFiles, mkdirp } = require('./util')

const writeJson = (path, object) =>
  fs.writeFileSync(path, JSON.stringify(object, null, 2))

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
    async updateForm(_, { form, formId }, ctx) {
      // DONE
      form = JSON.parse(form)
      try {
        const folderPath = `${config.get(
          'pubsweet-component-xpub-formbuilder.path',
        )}/`
        let path = `${folderPath}${formId}.json`

        if (fs.existsSync(path)) {
          let forms = JSON.parse(fs.readFileSync(path, 'utf8'))
          forms = Object.assign(forms, form)
          form = forms
          if (formId !== form.id) {
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
    async updateFormElement(_, { element, formId }, ctx) {
      // DONE
      element = JSON.parse(element)

      const folderPath = `${config.get(
        'pubsweet-component-xpub-formbuilder.path',
      )}/`
      const path = `${folderPath}${formId}.json`
      const form = JSON.parse(fs.readFileSync(path, 'utf8'))
      if (!form.children) {
        form.children = [element]
      } else if (form.children.some(e => e.id === element.id)) {
        form.children = form.children.map(value =>
          value.id === element.id ? element : value,
        )
      } else {
        form.children.push(element)
      }

      writeJson(path, form)
      return mergeFiles(folderPath)
    },
  },
  Query: {
    async getFile() {
      return JSON.parse(
        fs.readFileSync(
          path.join(__dirname, '../../../app/storage/forms/submit.json'),
        ),
      )
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
