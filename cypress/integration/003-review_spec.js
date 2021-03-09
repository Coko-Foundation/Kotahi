const doReview = name => {
  cy.login(name)

  cy.get('[data-testid="accept-review"]').click()
  cy.contains('Do Review').click()

  cy.contains('My URL submission')
  cy.contains('This is my data and code availability statement')

  cy.get('[data-testid="reviewComment"]')
    .click()
    .type(`Great paper, congratulations! ${name}`)
  cy.get('[data-testid="confidentialComment"]')
    .click()
    .type(`This is a very important paper. ${name}`)

  cy.contains('Accept').click()
  cy.contains('Submit').click()

  cy.visit('/kotahi/dashboard')
  cy.contains('Completed')
}

describe('Completing a review', () => {
  it('accept and do a review', () => {
    cy.task('restore', 'reviewers_invited')

    doReview('Gale Davis') // Reviewers
    doReview('Sherry Crofoot')
    doReview('Elaine Barnes')

    cy.login('Joanne Pilger') // Senior editor

    cy.get('[data-testid="completed"]').should('have.text', '3completed')

    cy.task('dump', 'three_reviews_completed')
  })
})
