import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { Menu } from '../../page-object/page-component/menu'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { dashboard } from '../../support/routes'

describe('Manuscripts page tests', () => {
  beforeEach(() => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'initialState')

    // login as admin
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })
    Menu.clickManuscripts()
  })

  it('check Submit button is visible', () => {
    ManuscriptsPage.getSubmitButton().should('be.visible')
  })

  it('After submit an article user is redirect to Manuscripts page', () => {
    ManuscriptsPage.getEvaluationButton().should('not.exist')
    ManuscriptsPage.clickSubmit()

    NewSubmissionPage.clickSubmitURL()

    // fill the submit form and submit it
    return cy.fixture('form_option').then(data => {
      SubmissionFormPage.fillInArticleld(data.field1)
      SubmissionFormPage.fillInArticleUrl(data.field2)
      SubmissionFormPage.fillInDescription(data.field3)
      SubmissionFormPage.fillInEvaluationContent(data.field4)
      SubmissionFormPage.clickElementFromFormOptionList(4)
      SubmissionFormPage.selectDropdownOption(1)
      SubmissionFormPage.clickSubmitResearch()
      SubmissionFormPage.clickSubmitManuscript()

      // asserts on the manuscripts page
      ManuscriptsPage.getManuscriptsPageTitle().should('be.visible')
      ManuscriptsPage.getEvaluationButton().should('be.visible')
      ManuscriptsPage.getControlButton().should('not.exist')
    })
  })
})
