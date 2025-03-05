const { NotFoundError } = require('@coko/server/src/errors')

const { Form } = require('../models')

const createForm = async form => {
  return Form.query().insertAndFetch(form)
}

const deleteForm = async formId => {
  await Form.query().deleteById(formId)
  return { query: {} }
}

const deleteFormElement = async (formId, elementId) => {
  const form = await Form.findById(formId)

  if (!form) return null
  form.structure.children = form.structure.children.filter(
    child => child.id !== elementId,
  )

  const formRes = await Form.query().patchAndFetchById(formId, {
    structure: form.structure,
  })

  return formRes
}

const formForPurposeAndCategory = async (purpose, category, groupId) => {
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
}

const getActiveForms = async groupId => {
  const forms = await Form.query()
    .where({ category: 'submission', purpose: 'submit', groupId })
    .orWhere({ category: 'review', purpose: 'review', groupId })
    .orWhere({ category: 'decision', purpose: 'decision', groupId })

  return {
    submissionForm: forms.find(f => f.purpose === 'submit'),
    reviewForm: forms.find(f => f.purpose === 'review'),
    decisionForm: forms.find(f => f.purpose === 'decision'),
  }
}

const getFormById = async formId => {
  return Form.findById(formId)
}

const getForms = async () => {
  return Form.query()
}

const getFormsByCategory = async (category, groupId) => {
  return Form.query().where({
    category,
    groupId,
  })
}

const notFoundError = (property, value, className) =>
  new NotFoundError(`Object not found: ${className} with ${property} ${value}`)

const updateForm = async form => {
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
}

const updateFormElement = async (element, formId) => {
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
}

module.exports = {
  createForm,
  deleteForm,
  deleteFormElement,
  formForPurposeAndCategory,
  getActiveForms,
  getFormById,
  getForms,
  getFormsByCategory,
  updateForm,
  updateFormElement,
}
