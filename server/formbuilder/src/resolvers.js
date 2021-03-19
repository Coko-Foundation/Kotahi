const config = require('config')
const fs = require('fs')
const { readFiles, mkdirp } = require('./util')

const writeJson = (filePath, object) =>
  fs.writeFileSync(filePath, JSON.stringify(object, null, 2))

const mergeFiles = folderPath =>
  readFiles(folderPath).then(files => {
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

        const filePath = `${folderPath}${formId}.json`

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
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

        const filePath = `${folderPath}/${formId}.json`
        const form = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        if (form.children) {
          const children = form.children.filter(el => el.id !== elementId)
          form.children = children
          writeJson(filePath, form)
        }

        const forms = await mergeFiles(folderPath)
        return forms
      } catch (err) {
        throw new Error(err)
      }
    },
    async createForm(_, { form }, ctx) {
      try {
        const formObj = JSON.parse(form)

        const folderPath = `${config.get(
          'pubsweet-component-xpub-formbuilder.path',
        )}/`

        const filePath = `${folderPath}/${formObj.id}.json`

        if (!fs.existsSync(filePath)) {
          mkdirp(folderPath)
          writeJson(filePath, formObj)
        }

        const forms = await mergeFiles(folderPath)

        return forms
      } catch (err) {
        throw new Error(err)
      }
    },
    async updateForm(_, { form, formId }, ctx) {
      // DONE
      let formObj = JSON.parse(form)

      try {
        const folderPath = `${config.get(
          'pubsweet-component-xpub-formbuilder.path',
        )}/`

        let filePath = `${folderPath}${formId}.json`

        if (fs.existsSync(filePath)) {
          const oldForm = JSON.parse(fs.readFileSync(filePath, 'utf8'))
          formObj = { ...oldForm, ...formObj }

          if (formId !== formObj.id) {
            fs.unlinkSync(filePath)
            filePath = `${folderPath}${formObj.id}.json`
          }
        }

        writeJson(filePath, formObj)

        const forms = await mergeFiles(folderPath)

        return forms
      } catch (err) {
        throw new Error(err)
      }
    },
    async updateFormElement(_, { element, formId }, ctx) {
      // DONE
      const elementObj = JSON.parse(element)

      const folderPath = `${config.get(
        'pubsweet-component-xpub-formbuilder.path',
      )}/`

      const filePath = `${folderPath}${formId}.json`
      const form = JSON.parse(fs.readFileSync(filePath, 'utf8'))

      if (!form.children) {
        form.children = [elementObj]
      } else if (form.children.some(e => e.id === elementObj.id)) {
        form.children = form.children.map(value =>
          value.id === elementObj.id ? elementObj : value,
        )
      } else {
        form.children.push(elementObj)
      }

      writeJson(filePath, form)
      return mergeFiles(folderPath)
    },
  },
  Query: {
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

        const filePath = `${folderPath}${formId}.json`
        const form = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        return form
      } catch (err) {
        throw new Error(err)
      }
    },
  },
}

module.exports = resolvers
