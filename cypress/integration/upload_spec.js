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

    cy.get('[data-testid="meta.title"]').type(
      '{selectall}{del}A Manuscript For The Ages',
    )

    cy.get('[data-testid="meta.abstract"]').type(`{selectall}{del}
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem.
    `)

    cy.get('[data-testid="meta.keywords"]').type('quantum, machines, nature')

    // TODO: Find a way to not match by partial class
    cy.get('[class*="Menu__Root"]').click()
    cy.get('[class*="Menu__Root"] [role="option"]:first').click()

    // TODO: Find a way to remove the forces
    cy.get('[name="meta.articleSections"]:first').click({ force: true })
    cy.get('[name="meta.declarations.openData"]:first').click({ force: true })
    cy.get('[name="meta.declarations.previouslySubmitted"]:nth(1)').click({
      force: true,
    })
    cy.get('[name="meta.declarations.openPeerReview"]:first').click({
      force: true,
    })
    cy.get('[name="meta.declarations.streamlinedReview"]:nth(1)').click({
      force: true,
    })
    cy.get('[name="meta.declarations.researchNexus"]:nth(1)').click({
      force: true,
    })
    cy.get('[name="meta.declarations.preregistered"]:first').click({
      force: true,
    })

    cy.get('[data-testid="suggestions.reviewers.suggested"]').type('Jane Doe')
    cy.get('[data-testid="suggestions.reviewers.opposed"]').type('James Doe')

    cy.get('[data-testid="suggestions.editors.suggested"]').type('John Ode')
    cy.get('[data-testid="suggestions.editors.opposed"]').type('Gina Ode')

    cy.get('[name="meta.notes.0.content"] div[contenteditable="true"]').type(
      'This work was supported by the Trust [grant numbers 393,295]; the Natural Environment Research Council [grant number 49493]; and the Economic and Social Research Council [grant number 30304]',
    )
    cy.get('[name="meta.notes.1.content"] div[contenteditable="true"]').type(
      'This is extremely divisive work, choose reviewers with care.',
    )

    cy.get('form button:last').click()
    cy.get('button[type="submit"]').click()

    cy.visit('/dashboard')
    cy.contains('A Manuscript For The Ages')
  })
})
