/* eslint-disable jest/expect-expect */
import { DashboardPage } from '../../page-object/dashboard-page'
import { ControlPage } from '../../page-object/control-page'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { dashboard } from '../../support/routes1'

const decisionTextContent = 'Please fix Foo in the Paper!'
const decisionFileName = 'test-pdf.pdf'
const decisinFilePath = 'cypress/fixtures/test-pdf.pdf'

describe('checking manuscript version', () => {
  it('editor checks for new manuscript version', () => {
    cy.task('restore', 'commons/colab_bootstrap')
    cy.task('seed', 'three_reviews_completed')
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
      // eslint-disable-next-line jest/valid-expect-in-promise
      DashboardPage.clickManuscriptNavButton()
      ManuscriptsPage.selectOptionWithText('Control')
      /* Assign Editor */
      // ControlPage.getAssignSeniorEditorDropdown()
      //   .click({ force: true })
      //   .type(`${name.role.seniorEditor}{enter}`)

      /* Editor  Submits a decision */
      cy.login(name.role.seniorEditor, dashboard)
      DashboardPage.clickDashboardTab(2)
      DashboardPage.clickControl() // Navigate to Control Page
      ControlPage.clickDecisionTab(1)
      /* Verify publish button is disabled */
      ControlPage.getPublishButton().should('be.disabled')
      /* Fill the decision form */
      ControlPage.clickDecisionTextInput()
      ControlPage.getDecisionTextInput().type(decisionTextContent)
      ControlPage.getDecisionFileInput().selectFile(decisinFilePath, {
        force: true,
      })
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000)
      cy.contains('Decision Status').scrollIntoView()
      // ReviewPage.clickRevise()
      cy.get('[class*=FormTemplate__SafeRadioGroup]').eq(1).click()
      /* Submit the decision */
      ControlPage.clickSubmitDecisionButton()
      /* Check appears in front of button */
      ControlPage.checkSvgExists()

      /* View Decision as an Author */
      cy.login(name.role.author, dashboard)
      /* Click on first MySubmission */
      DashboardPage.getSubmittedManuscript().click()
      /* Verify Decision Content */
      DashboardPage.getDecisionField(0).should('contain', decisionTextContent)
      DashboardPage.getDecisionField(1).should('contain', decisionFileName)
      DashboardPage.getDecisionField(2).should('contain', 'Revise')
      /* Create new manuscript version */
      DashboardPage.clickCreateNewVersionButton()
      SubmissionFormPage.waitThreeSec()
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('submission_form_data').then(data => {
        SubmissionFormPage.fillInAbstractColab(data.abstract)
        SubmissionFormPage.getWaxInputBox(0).fillInput(data.abstract)
        SubmissionFormPage.fillInFirstAuthor(data.creator)
        SubmissionFormPage.fillInDatePublished(data.date)
        SubmissionFormPage.fillInPreprintUri(data.doi)
        SubmissionFormPage.fillInOurTake(data.ourTake)
        SubmissionFormPage.fillInMainFindings(data.mainFindings)
        SubmissionFormPage.fillInStudyStrengths(data.studyStrengths)
        SubmissionFormPage.fillInLimitations(data.limitations)
        SubmissionFormPage.fillInKeywords(data.keywords)
        SubmissionFormPage.fillInReviewCreator(data.creator)
      })
      SubmissionFormPage.clickSubmitResearch()
      SubmissionFormPage.clickSubmitYourManuscript()
      /* Verify new submission got created */
      DashboardPage.getSubmittedManuscript()
        .contains('test pdf')
        .should('exist')

      /* Login as editor and check the new version submission form */
      cy.login(name.role.seniorEditor, dashboard)
      DashboardPage.clickDashboardTab(2)
      DashboardPage.clickControl() // Navigate to Control Page
      ControlPage.clickDecisionTab(1)
      /* Verify publish button is disabled */
      ControlPage.getPublishButton().should('be.disabled')
    })
  })
})
