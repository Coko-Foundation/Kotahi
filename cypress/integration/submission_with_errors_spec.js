describe('Submission with errors test', () => {
  it('can submit a URL and some metadata', () => {
    cy.task('restore', 'initialState')

    cy.login('Emily Clay')

    cy.get('button')
      .contains('New submission')
      .click()
    cy.get('button')
      .contains('Submit a URL instead')
      .click()

    cy.get('body').contains('Submission created')

    cy.contains('button', 'Submit your research object').click()

    cy.get('body').contains('Enter at least 4 characters')

    cy.get('[data-testid="submission.name"]')
      .click()
      .type('Emily Clay')

    cy.contains('button', 'Submit your research object').click()

    cy.get('body').contains('Enter at least 2 characters')

    cy.get('[data-testid="submission.keywords"]')
      .click()
      .type('some, keywords')

    // Change the title so that we can look for it
    cy.get('input[data-testid="meta.title"]')
      .click()
      .clear()
      .type('My Fixed URL Submission')

    cy.contains('button', 'Submit your research object').click()
    cy.get('button')
      .contains('Submit your manuscript')
      .click()

    cy.get('body').contains('My Fixed URL Submission')
  })
})
