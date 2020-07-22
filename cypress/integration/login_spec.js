describe('Login test', () => {
  it('Can log in as admin (and logout)', () => {
    cy.task('restore', 'initialState')
    cy.task('createToken', 'Sinead Sullivan').then(token => {
      cy.setToken(token)
      cy.visit('/journal/dashboard')
    })

    // console.log(localStorage.getItem('token'))

    cy.get('nav').contains('Sinead')
    cy.get('nav').contains('Dashboard')
    cy.get('nav').contains('admin')

    cy.contains('You have not submitted any manuscripts yet')
  })
})
