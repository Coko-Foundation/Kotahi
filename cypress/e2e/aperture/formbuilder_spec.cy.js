/* eslint-disable jest/expect-expect */
import { FormsPage } from '../../page-object/forms-page'
import { Menu } from '../../page-object/page-component/menu'
import { dashboard } from '../../support/routes'

describe('Form builder', () => {
  it('views a form field', () => {
    // task to restore the database as per the  dumps/commons/bootstrap.sql
    cy.task('restore', 'commons/bootstrap')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })

    // enter the from page and assert the fileds
    cy.contains('Settings').click()
    Menu.clickForms()
    cy.contains('Submission').click()

    // For Submission field
    FormsPage.getFormTitleTab(0).should(
      'contain',
      'Research Object Submission Form',
    )
    FormsPage.clickFormOption(1)
    FormsPage.getFieldValidate()
    cy.get(':nth-child(8) > .style__Legend-sc-1npdrat-1')
    cy.get(
      ':nth-child(8) > :nth-child(2) > .css-3x5r4n-container > .react-select__control > .react-select__value-container',
    ).click()
    cy.get('.react-select__option').eq(0).click()
    cy.contains('Update Field').click()
    // adding a field in submission form
    cy.contains('Add Field').click({ force: true })
    cy.contains('Choose in the list').click()
    cy.get('button')
    cy.contains('Single image attachment').click()
    cy.contains('Name (internal field name)').click()
    cy.get('[name=name]').type('submission.visualAbstract')
    cy.contains('Update Field').click()

    // for review field
    cy.contains('Review').click()
    FormsPage.getFormTitleTab(0).should('contain', 'Review')
    FormsPage.clickFormOption(1)
    FormsPage.getNameField().should('have.value', 'files').clear()
    cy.get('[name=name]').type('files')
    cy.contains('Update Field').click()

    // adding a field in review form
    cy.contains('Add Field').click({ force: true })
    cy.contains('Choose in the list').click()
    cy.get('button')
    cy.contains('Single image attachment').click()
    cy.contains('Name (internal field name)').click()
    cy.get('[name=name]').type('visualAbstract')
    cy.contains('Update Field').click()

    // for decision field
    cy.contains('Decision').click()
    FormsPage.getFormTitleTab(0).should('contain', 'Decision')
    FormsPage.clickFormOption(1)
    FormsPage.getNameField().should('have.value', 'files').clear()
    cy.get('[name=name]').type('files')
    cy.contains('Update Field').click()

    // adding a field in decision form
    cy.contains('Add Field').click({ force: true })
    cy.contains('Choose in the list').click()
    cy.get('button')
    cy.contains('Single image attachment').click()
    cy.contains('Name (internal field name)').click()
    cy.get('[name=name]').type('visualAbstract')
    cy.contains('Update Field').click()
  })
})
