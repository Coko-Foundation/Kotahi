describe('Publishing a submission', () => {
  it('publish an accepted submission', () => {
    cy.task('restore', 'decision_completed')

    cy.login('Joanne Pilger') // Senior editor

    cy.contains('Control Panel').click()

    cy.get('button')
      .contains('Publish')
      .click()
    cy.contains('submission was published')

    cy.contains('Dashboard').click()
    cy.contains('Accepted & Published')

    cy.task('dump', 'published_submission')
  })
})
