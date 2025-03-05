const {
  createForm,
  deleteForm,
  deleteFormElement,
  formForPurposeAndCategory,
  getFormById,
  getForms,
  getFormsByCategory,
  updateForm,
  updateFormElement,
} = require('../../../controllers/form.controllers')

module.exports = {
  Query: {
    form: async (_, { formId }) => {
      return getFormById(formId)
    },

    formForPurposeAndCategory: async (_, { purpose, category, groupId }) => {
      return formForPurposeAndCategory(purpose, category, groupId)
    },

    forms: async () => {
      return getForms()
    },

    formsByCategory: async (_, { category, groupId }) => {
      return getFormsByCategory(category, groupId)
    },

    /** Returns the specific requested form */
  },

  Mutation: {
    createForm: async (_, { form }) => {
      return createForm(form)
    },

    deleteForm: async (_, { formId }) => {
      return deleteForm(formId)
    },

    deleteFormElement: async (_, { formId, elementId }) => {
      return deleteFormElement(formId, elementId)
    },

    updateForm: async (_, { form }) => {
      return updateForm(form)
    },

    updateFormElement: async (_, { element, formId }) => {
      return updateFormElement(element, formId)
    },
  },
}
