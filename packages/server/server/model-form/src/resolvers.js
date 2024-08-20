const { NotFoundError } = require('@coko/server/src/errors')
const Form = require('../../../models/form/form.model')

const notFoundError = (property, value, className) =>
  new NotFoundError(`Object not found: ${className} with ${property} ${value}`)

const resolvers = {
  Mutation: {
    deleteForm: async (_, { formId }) => {
      await Form.query().deleteById(formId)
      return { query: {} }
    },
    deleteFormElement: async (_, { formId, elementId }) => {
      const form = await Form.findById(formId)

      if (!form) return null
      form.structure.children = form.structure.children.filter(
        child => child.id !== elementId,
      )

      const formRes = await Form.query().patchAndFetchById(formId, {
        structure: form.structure,
      })

      return formRes
    },
    createForm: async (_, { form }) => {
      return Form.query().insertAndFetch(form)
    },
    updateForm: async (_, { form }) => {
      const result = await Form.query().patchAndFetchById(form.id, form)
      if (!result) throw new Error('Attempt to update non-existent form')

      const purposeIndicatingActiveForm =
        result.category === 'submission' ? 'submit' : result.category

      const thisFormIsActive = result.purpose === purposeIndicatingActiveForm

      if (thisFormIsActive) {
        // Ensure all other forms in this category are inactive
        await Form.query()
          .patch({ purpose: 'other' })
          .whereNot({ purpose: 'other' })
          .where({ category: result.category, groupId: result.groupId })
          .whereNot({ id: result.id })
      }

      return result
    },
    updateFormElement: async (_, { element, formId }) => {
      const form = await Form.findById(formId)
      if (!form) return null

      if (element.name === '$verdict' && Array.isArray(element.options)) {
        // eslint-disable-next-line no-param-reassign
        element.options = element.options.map(option => ({
          ...option,
          value: option.value.trim(),
        }))
      }

      const indexToReplace = form.structure.children.findIndex(
        field => field.id === element.id,
      )

      if (indexToReplace < 0) form.structure.children.push(element)
      else form.structure.children[indexToReplace] = element

      return Form.query().patchAndFetchById(formId, {
        structure: form.structure,
      })
    },
  },
  Query: {
    form: async (_, { formId }) => Form.findById(formId),
    forms: async () => Form.query(),
    formsByCategory: async (_, { category, groupId }) =>
      Form.query().where({
        category,
        groupId,
      }),

    /** Returns the specific requested form */
    formForPurposeAndCategory: async (_, { purpose, category, groupId }) => {
      const form = await Form.query().findOne({
        purpose,
        category,
        groupId,
      })

      if (!form) {
        throw notFoundError(
          'Category and purpose',
          `${purpose} ${category}`,
          this.name,
        )
      }

      // TODO Remove this once the form-builder no longer permits incomplete/malformed fields.
      form.structure.children = form.structure.children.filter(
        field => field.component && field.name,
      )

      return form
    },
  },
}

module.exports = resolvers
