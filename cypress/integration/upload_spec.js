const login = (username, password = 'password') => {
  cy.get('input[name="username"]')
    .click()
    .type(username)
  cy.get('input[name="password"]')
    .click()
    .type(password)
  cy.get('button[type="submit"]').click()
}

const doReview = (username, note, confidential, recommendation) => {
  // 1. Login
  login(username)

  // 2. Accept and do the review
  cy.get('[data-testid=accept-review]').click()
  cy.contains('Do Review').click()

  cy.get('[placeholder*="Enter your review"] div[contenteditable="true"]')
    .focus()
    .type(note)
    .blur()
  cy.wait(500)
  cy.get(
    '[placeholder*="Enter a confidential note"] div[contenteditable="true"]',
  )
    .focus()
    .type(confidential)
    .blur()
  cy.wait(500)
  // 0 == accept, 1 == revise, 2 == reject
  cy.get(`[class*=Radio__Label]:nth(${recommendation})`).click()
  cy.get('button[type=submit]').click()

  // 3. Logout
  cy.get('nav button').click()
}

describe('PDF submission test', () => {
  it('can upload and submit a PDF', () => {
    cy.visit('/dashboard')

    // 1. Log in as author
    login('author')

    // 2. Submit a PDF
    cy.fixture('test-pdf.pdf', 'base64').then(fileContent => {
      cy.get('[data-testid="dropzone"]').upload(
        { fileContent, fileName: 'test-pdf.pdf', mimeType: 'application/pdf' },
        { subjectType: 'drag-n-drop' },
      )
    })

    cy.get('body').contains('Submission information')
    cy.get('[data-testid="meta.title"]').contains('test pdf')
    cy.get('[data-testid="meta.title"] div[contenteditable="true"]')
      .click()
      .type('{selectall}{del}A Manuscript For The Ages')

    cy.get('[data-testid="meta.abstract"] div[contenteditable="true"]')
      .click()
      .type(
        `{selectall}{del}Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem.`,
      )

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

    cy.get('[name="meta.notes.0.content"] div[contenteditable="true"]')
      .click()
      .type(
        'This work was supported by the Trust [grant numbers 393,295]; the Natural Environment Research Council [grant number 49493].',
      )
    cy.get('[name="meta.notes.1.content"] div[contenteditable="true"]')
      .click()
      .type('This is extremely divisive work, choose reviewers with care.')

    cy.get('form button:last').click()
    cy.get('button[type="submit"]').click()

    cy.visit('/dashboard')
    cy.contains('A Manuscript For The Ages')

    // 3. Logout
    cy.get('nav button').click()

    // 4. And login as admin
    login('admin', 'password')

    cy.get('[data-testid="control-panel"]').click()

    // 5. Assign senior editor
    // TODO: Find a way to not match by partial class
    cy.get('[class*="AssignEditor"] [class*="Menu__Root"]:first').click()
    cy.get(
      '[class*="AssignEditor"] [class*="Menu__Root"]:first [role="option"]:nth(1)',
    ).click()

    // 6. Assign handling editor
    cy.get('[class*="AssignEditor"] [class*="Menu__Root"]:nth(1)').click()
    cy.get(
      '[class*="AssignEditor"] [class*="Menu__Root"]:nth(1) [role="option"]:nth(2)',
    ).click()

    // 7. Logout
    cy.get('nav button').click()

    // 8. And login as handling editor
    login('heditor')

    cy.get('[data-testid="control-panel"]').click()

    // 9. Assign reviewers
    cy.get('[class*="AssignEditorsReviewers"] a').click()

    cy.get('.Select-control').click()
    cy.get('.Select-menu[role="listbox"] [role="option"]:nth(3)').click()
    cy.get('button[type="submit"]').click()
    cy.get('[class*="Reviewer__"]').should('have.length', 1)

    cy.get('.Select-control').click()
    cy.get('.Select-menu[role="listbox"] [role="option"]:nth(4)').click()
    cy.get('button[type="submit"]').click()
    cy.get('[class*="Reviewer__"]').should('have.length', 2)

    cy.get('.Select-control').click()
    cy.get('.Select-menu[role="listbox"] [role="option"]:nth(5)').click()
    cy.get('button[type="submit"]').click()
    cy.get('[class*="Reviewer__"]').should('have.length', 3)

    // 10. Check that 3 reviewers are invited
    cy.contains('SimpleJ').click()
    cy.get('[data-testid="invited"]').contains('3')

    // 11. Logout
    cy.get('nav button').click()

    doReview(
      'reviewer1',
      'Great research into CC bases in the ky289 variant are mutated to TC which results in the truncation of the SAD-1.',
      'Not too bad.',
      0,
    )
    doReview(
      'reviewer2',
      'Mediocre analysis of Iron-Sulfur ClUster assembly enzyme homolog.',
      'It is so so.',
      1,
    )
    doReview(
      'reviewer3',
      'mTOR-Is positively influence the occurrence and course of certain tumors after solid organ transplantation.',
      'It is not good.',
      2,
    )

    // 12. Log in as handling editor
    login('heditor')
    cy.get('[data-testid="control-panel"]').click()
  })
})
