describe('Completing a review', () => {
  it('accept and do a review', () => {
    cy.task('restore', 'three_reviews_completed')

    cy.login('Joanne Pilger') // Senior editor

    cy.contains('Control Panel').click()

    cy.get('[data-testid="decisionComment"]')
      .click()
      .type(`Great paper, dear authors, congratulations!`)

    cy.contains('Accept').click()
    cy.contains('Submit').click()
    cy.visit('/journal/dashboard')
    cy.contains('Accepted')

    // Regression test, previously this count increased when a decision was made
    cy.get('[data-testid="completed"]').should('have.text', '3completed')

    cy.task('dump', 'decision_completed')
  })
})
