/* eslint-disable jest/expect-expect */
import { FormsPage } from '../../page-object/forms-page'
import { Menu } from '../../page-object/page-component/menu'
import { dashboard } from '../../support/routes'

describe('Form builder', () => {
  it('views a form field', () => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'initialState')
    cy.task('seedForms')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })
    // enter email
    cy.contains('Enter Email').click()
    cy.get('#enter-email').type('admin@gmail.com')

    // submit the email
    cy.contains('Next').click()

    // enter the from page and assert the fileds
    Menu.clickForms()

    FormsPage.getFormTitleTab(0).should(
      'contain',
      'Submission',
      'Research Object Submission Form',
    )
    FormsPage.clickFormOption(2)
    FormsPage.getNameField().should('have.value', 'submission.name')
  })
})
