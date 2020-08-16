describe('Form builder', () => {
  it('views a form field', () => {
    cy.task('restore', 'initialState')
    cy.login('Sinead Sullivan') // Admin
    cy.contains('Forms').click()
    cy.contains('Research Object Submission Form')
    cy.contains('Name (TextField)').click()
    cy.get('input[name="name"]').should('have.value', 'submission.name')
  })
})
