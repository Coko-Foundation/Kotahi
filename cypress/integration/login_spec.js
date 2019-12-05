describe('Login test', () => {
  it('Can log in as admin (and logout)', () => {
    cy.task('db:seed')
    cy.visit('/dashboard')

    const username = 'admin'
    const password = 'password'

    cy.get('input[name="username"]').type(username)
    cy.get('input[name="password"]').type(password)
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/dashboard')
    cy.get('nav')
      .contains('Login')
      .should('not.exist')
    cy.get('nav').contains('admin')
    cy.get('nav').contains('Logout')

    cy.get('nav button').click()
    cy.get('nav').contains('Login')
  })
})
