describe('PDF submission test', () => {
  it('can upload and submit a PDF', () => {
    cy.visit('/dashboard')

    const username = 'admin'
    const password = 'password'

    cy.get('input[name="username"]').type(username)
    cy.get('input[name="password"]').type(password)
    cy.get('button[type="submit"]').click()

    cy.fixture('test-pdf.pdf', 'base64').then(fileContent => {
      cy.get('[data-testid="dropzone"]').upload(
        { fileContent, fileName: 'test-pdf.pdf', mimeType: 'application/pdf' },
        { subjectType: 'drag-n-drop' },
      )
    })

    cy.get('body').contains('Submission information')
    cy.get('[data-testid="meta.title"]').contains('test pdf')
  })
})
