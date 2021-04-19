const typeDefs = `
  input FormInput {
    id: ID!
    created: DateTime
    updated: DateTime
    purpose: String!
    structure: FormStructureInput!
  }

  input CreateFormInput {
    created: DateTime
    purpose: String!
    structure: FormStructureInput!
  }

  input FormStructureInput {
    name: String
    description: String
    haspopup: String!
    popuptitle: String
    popupdescription: String
    children: [FormElementInput!]!
  }

  input FormElementInput {
    options: [FormElementOptionInput!]
    title: String
    shortDescription: String
    id: ID!
    component: String
    name: String
    description: String
    doiValidation: String
    placeholder: String
    parse: String
    format: String
    validate: [FormElementOptionInput!]
    validateValue: FormElementValidationInput
  }

  input FormElementOptionInput {
    label: String!
    value: String!
    id: ID!
  }

  input FormElementValidationInput {
    minChars: String
    maxChars: String
    minSize: String
  }

  type Form {
    id: ID!
    created: DateTime!
    updated: DateTime
    purpose: String!
    structure: FormStructure!
  }

  type FormStructure {
    name: String
    description: String
    haspopup: String!
    popuptitle: String
    popupdescription: String
    children: [FormElement!]!
  }

  type FormElement {
    options: [FormElementOption!]
    title: String
    shortDescription: String
    id: ID!
    component: String
    name: String
    description: String
    doiValidation: String
    placeholder: String
    parse: String
    format: String
    validate: [FormElementOption!]
    validateValue: FormElementValidation
  }

  type FormElementOption {
    label: String!
    value: String!
    id: ID!
  }

  type FormElementValidation {
    minChars: String
    maxChars: String
    minSize: String
  }

  type DeleteFormPayload {
    query: Query
  }

  extend type Query {
    form(formId: String!): Form
    forms: [Form]
    formForPurpose(purpose: String!): Form
  }

  extend type Mutation {
    createForm(form: CreateFormInput!): Form
    updateForm(form: FormInput!): Form
    updateFormElement(element: FormElementInput!, formId: String!): Form
    deleteFormElement(formId: ID!, elementId: ID!): Form
    deleteForm(formId: ID!): DeleteFormPayload
  }
`

module.exports = typeDefs
