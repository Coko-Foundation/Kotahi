const typeDefs = `
  input FormInput {
    id: ID!
    created: String
    updated: String
    purpose: String!
    structure: FormStructure!
  }

  type Form {
    id: ID!
    created: String!
    updated: String
    purpose: String!
    structure: FormStructure!
  }

  scalar FormStructure
  scalar FormElementStructure

  type CreateFormPayload {
    recordId: ID
    record: Form
    query: Query
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
    createForm(form: FormInput!): CreateFormPayload
    updateForm(form: FormInput!): Form
    updateFormElement(element: FormElementStructure!, formId: String!): Form
    deleteFormElement(formId: ID!, elementId: ID!): Form
    deleteForm(formId: ID!): DeleteFormPayload
  }
`

module.exports = typeDefs
