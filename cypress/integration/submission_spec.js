// const URLsubmission = {
//   title:
// }
const login = name => {
  cy.task('createToken', name).then(token => {
    cy.setToken(token)
    cy.visit('/journal/dashboard')
  })
}

describe('URL submission test', () => {
  it('can submit a URL and some metadata', () => {
    cy.task('restore', 'initialState')

    login('Emily Clay')

    cy.get('button')
      .contains('New submission')
      .click()
    cy.get('button')
      .contains('Submit a URL instead')
      .click()

    cy.get('body').contains('Submission created')
    cy.get('input[data-testid="meta.title"]')
      .click()
      .clear()
      .type('My URL submission')
    cy.get('[data-testid="submission.name"]')
      .click()
      .type('Emily Clay')

    cy.get('[data-testid="submission.affiliation"]')
      .click()
      .type('Example University, Egland')

    cy.get('[data-testid="submission.contact"]')
      .click()
      .type('emily@example.com')

    cy.get('[data-testid="submission.cover"] div[contenteditable="true"]')
      .click()
      .type('This is my cover letter')

    cy.get('[data-testid="submission.datacode"] div[contenteditable="true"]')
      .click()
      .type('This is my data and code availability statement')

    cy.get('[data-testid="submission.ethics"] div[contenteditable="true"]')
      .click()
      .type('This is my ethics statement')

    cy.get('*[aria-label="Type of Research Object"]').click({ force: true })
    cy.get('#react-select-2-option-1').click()
    cy.get('[data-testid="submission.suggested"]')
      .click()
      .type('Erica James, Matthew Matretzky')

    cy.get('[data-testid="submission.links"]')
      .click()
      .type(
        'https://doi.org/10.6084/m9.figshare.913521.v1, https://github.com/jure/mathtype_to_mathml',
      )

    // Supplementary file upload
    cy.fixture('test-pdf.pdf', 'base64').then(fileContent => {
      cy.get('[data-testid="dropzone"]').attachFile(
        'test-pdf.pdf',
        // {
        //   fileContent,
        //   fileName: 'test-pdf.pdf',
        //   encoding: 'base64',
        //   mimeType: 'application/pdf',
        // },
        { subjectType: 'drag-n-drop' },
      )
    })

    cy.get('[data-testid="submission.keywords"]')
      .click()
      .type('some, keywords')

    cy.get('*[aria-label*="healthy subjects only or patients"]').click({
      force: true,
    })
    cy.get('#react-select-3-option-1').click()

    cy.get('*[aria-label*="involved human subjects"]').click({
      force: true,
    })
    cy.get('#react-select-4-option-0').click()

    cy.get('*[aria-label*="animal research approved"]').click({
      force: true,
    })
    cy.get('#react-select-5-option-0').click()

    cy.get('input[name="submission.methods"][value="Functional MRI"]').click()
    cy.get('input[name="submission.methods"][value="Optical Imaging"]').click()

    cy.get('[data-testid="submission.otherMethods"]')
      .click()
      .type('Erica James, Matthew Matretzky')

    cy.get('*[aria-label*="what field strength"]').click({
      force: true,
    })
    cy.get('#react-select-6-option-3').click()

    cy.get('[data-testid="submission.humanMRIother"]')
      .click()
      .type('7T')

    cy.get('input[name="submission.packages"][value="SPM"]').click()
    cy.get('input[name="submission.packages"][value="FSL"]').click()

    cy.get('[data-testid="submission.otherPackages"]')
      .click()
      .type('Jupyter, Stencila')

    cy.get('[data-testid="submission.references"] div[contenteditable="true"]')
      .click()
      .type('Hyde, 2020')

    cy.get('button')
      .contains('Submit your research object')
      .click()
    cy.get('button')
      .contains('Submit your manuscript')
      .click()

    cy.get('body').contains('My Submissions')
    cy.get('body').contains('My URL submission')

    cy.task('dump', 'submission_complete')
  })

  it('senior editor can view the submission', () => {
    cy.task('restore', 'submission_complete')

    // Admin logs in to assign senior editor
    login('Sinead Sullivan')
    cy.get('nav')
      .contains('Manuscripts')
      .click()
    cy.get('tr[class*="Table__Row"]')
      .contains('Control')
      .click()
    cy.contains('My URL submission')

    cy.get('*[aria-label="Assign seniorEditor"]').click({ force: true })
    cy.get('*[id*="react-select"]')
      .contains('Joanne Pilger')
      .click()

    login('Joanne Pilger')
    cy.contains('My URL submission')

    cy.contains('Control Panel').click()
    cy.contains('This is my data and code availability statement')
    cy.contains('test-pdf.pdf')
    cy.task('dump', 'senior_editor_assigned')
  })
})

// Example of a file upload
//     2. Submit a PDF
//     cy.fixture('test-pdf.pdf', 'base64').then(fileContent => {
//       cy.get('[data-testid="dropzone"]').upload(
//         {
//           fileContent,
//           fileName: 'test-pdf.pdf',
//           encoding: 'base64',
//           mimeType: 'application/pdf',
//         },
//         { subjectType: 'drag-n-drop' },
//       )
//     })
// })
