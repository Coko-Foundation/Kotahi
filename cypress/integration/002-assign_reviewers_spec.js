// const login = name => {
//   cy.task('createToken', name).then(token => {
//     cy.setToken(token)
//     cy.visit('/journal/dashboard')
//   })
// }

const inviteReviewer = name => {
  cy.get('*[aria-label*="Invite reviewers"]').click({
    force: true,
  })
  cy.get('*[id*="react-select"]')
    .contains(name)
    .click()
  cy.get('button')
    .contains('Invite reviewer')
    .click()
}

describe('Editor assigning reviewers', () => {
  it('can assign 3 reviewers', () => {
    cy.task('restore', 'senior_editor_assigned')

    cy.login('Joanne Pilger')

    cy.contains('Control Panel').click()
    cy.contains('Manage Reviewers').click()

    cy.contains('Invite reviewers')

    // Invite first reviewer
    inviteReviewer('Gale Davis')
    cy.get('div[class*="Reviewers__Reviewer-"]').should('have.length', 1)
    // 2nd
    inviteReviewer('Sherry Crofoot')
    cy.get('div[class*="Reviewers__Reviewer-"]').should('have.length', 2)
    // 3rd
    inviteReviewer('Elaine Barnes')
    cy.get('div[class*="Reviewers__Reviewer-"]').should('have.length', 3)

    cy.get('nav')
      .contains('Dashboard')
      .click()

    cy.get('[data-testid="invited"]').should('have.text', '3invited')

    cy.task('dump', 'reviewers_invited')
  })
})
