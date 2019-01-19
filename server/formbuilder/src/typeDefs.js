const typeDefs = `
  extend type Query {
    getFile(form: String!): Form
    getForm(form: String!): Form
    getForms: Form
  }

  extend type Mutation {
    createForm(form: String!): Form
    updateForm(form: String!, id: String!): Form
    updateFormElements(form: String!, formId: String!): Form
    deleteFormElement(formId: ID!, elementId: ID!): Form
    deleteForms(formId: ID!): Form
  }

  scalar Form
`

module.exports = typeDefs
