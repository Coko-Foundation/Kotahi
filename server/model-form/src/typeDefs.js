const typeDefs = `
  input FormInput {
    id: ID!
    created: DateTime
    updated: DateTime
    purpose: String!
    structure: FormStructureInput!
    category: String!
    groupId: ID!
  }

  input CreateFormInput {
    created: DateTime
    purpose: String!
    structure: FormStructureInput!
    category: String!
    groupId: ID!
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
    label: String
    description: String
    doiValidation: String
    doiUniqueSuffixValidation: String
    placeholder: String
    parse: String
    format: String
    inline: String
    sectioncss: String
    validate: [FormElementOptionInput!]
    validateValue: FormElementValidationInput
    hideFromReviewers: String
    hideFromAuthors: String
    permitPublishing: String
    publishingTag: String
  }

  input FormElementOptionInput {
    label: String!
    value: String!
    labelColor: String
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
    category: String!
    groupId: ID
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
    doiUniqueSuffixValidation: String
    placeholder: String
    parse: String
    format: String
    inline: String
    sectioncss: String
    validate: [FormElementOption!]
    validateValue: FormElementValidation
    hideFromReviewers: String
    hideFromAuthors: String
    permitPublishing: String
    publishingTag: String
  }

  type FormElementOption {
    label: String!
    value: String!
    labelColor: String
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
    formsByCategory(category: String!, groupId: ID): [Form]
    formForPurposeAndCategory(purpose: String!, category: String!, groupId: ID): Form
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
