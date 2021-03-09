describe('Completing a review', () => {
  it('accept and do a review', () => {
    cy.task('restore', 'three_reviews_completed')

    cy.login('Joanne Pilger') // Senior editor

    cy.contains('Control Panel').click()

    cy.get('[data-testid="decisionComment"]').click()
    cy.focused().blur()

    // Validations run on blur
    cy.contains('Decision letter is required')
    cy.get('[data-testid="decisionComment"] div[contenteditable="true"]')
      .click({ force: true })
      .type(`Great paper, dear authors, congratulations!`)

    cy.contains('Accept').click({ force: true })
    cy.contains('Submit').click()
    cy.contains('Your decision has been saved.')
    cy.visit('/kotahi/dashboard')
    cy.contains('Accepted')

    // Regression test, previously this count increased when a decision was made
    cy.get('[data-testid="completed"]').should('have.text', '3completed')

    cy.task('dump', 'decision_completed')
  })
})
