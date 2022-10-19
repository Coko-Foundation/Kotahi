/* eslint-disable jest/expect-expect */
import { FormsPage } from '../../page-object/forms-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { dashboard } from '../../support/routes'

const bioRxivArticleUrl =
  'https://www.biorxiv.org/content/10.1101/2022.05.28.493855v1'

describe('Update the submission form field', () => {
  it('update submission form field for publishing to hypothesis group', () => {
    // task to restore the database as per the  dumps/commons/elife_bootstrap.sql
    cy.task('restore', 'commons/elife_bootstrap')
    cy.task('seedForms')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin.name, dashboard)
    })

    // enter the from page and assert the fileds()
    cy.contains('Settings').click()
    Menu.clickForms()
    cy.contains('Submission').click()

    // For Submission field
    FormsPage.getFormTitleTab(0).should('contain', 'eLife Submission Form')
    FormsPage.clickFormOption(3)
    FormsPage.getFieldValidate()

    cy.get(':nth-child(3) > .sc-dmlrTW').contains('Always').click()
    cy.get('form > :nth-child(15)').type('test_tag')
    cy.contains('Update Field').click({ force: true })
    Menu.clickManuscripts()
    DashboardPage.clickSubmissionButton()
    // Upload manuscript
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.get('button').contains('Submit a URL instead').click()
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('submission_form_data').then(data => {
      SubmissionFormPage.fillInArticleld(data.articleId)
      SubmissionFormPage.fillInDoi(data.doi)
      SubmissionFormPage.fillInArticleUrl(data.doi)
      SubmissionFormPage.fillInBioRxivArticleUrl(bioRxivArticleUrl)
      SubmissionFormPage.fillInDescription(data.description)
      SubmissionFormPage.waitThreeSec()
      SubmissionFormPage.clickSubmitResearch()
      cy.awaitDisappearSpinner()
      ManuscriptsPage.selectOptionWithText('Evaluation')
      SubmissionFormPage.clickSubmitResearch()
      cy.awaitDisappearSpinner()
      cy.intercept('/graphql').as('getResponse')
      ManuscriptsPage.getOptionWithText('Publish').click()
      cy.wait('@getResponse').its('response').should('deep.include', {
        statusCode: 200,
        statusMessage: 'OK',
      })
      SubmissionFormPage.waitThreeSec()
      ManuscriptsPage.getStatusField(0).contains('Published')
    })
  })
})
