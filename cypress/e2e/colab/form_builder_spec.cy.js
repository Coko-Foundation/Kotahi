/* eslint-disable jest/expect-expect, cypress/unsafe-to-chain-command */
import { FormsPage } from '../../page-object/forms-page'
import { Menu } from '../../page-object/page-component/menu'
import { dashboard } from '../../support/routes1'

describe('Form builder', () => {
  it('views a form field', () => {
    // task to restore the database as per the  dumps/commons/elife_bootstrap.sql
    cy.task('restore', 'commons/colab_bootstrap')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })

    // enter the from page and assert the fields()
    Menu.clickSettings()
    Menu.clickForms()
    cy.contains('Submission').click()

    // For Submission field
    FormsPage.getFormTitleTab(0).should(
      'contain',
      'Research Object Submission Form',
    )
    FormsPage.clickFormOption(1)
    FormsPage.getFieldValidate().scrollIntoView().click()
    cy.get('[class*="MenuList"] > div').eq(0).click()
    cy.contains('Save').click()

    // adding a field in submission form
    cy.get('[title="Add a field..."]').click()
    cy.getByDataTestId('fieldType').click()
    cy.contains('Single image attachment').scrollIntoView().click()
    cy.contains('Save').click()

    // for review field
    Menu.clickSettings()
    cy.contains('Review').click()
    FormsPage.getFormTitleTab(0).should('contain', 'Review')
    FormsPage.clickFormOption(1)
    FormsPage.getNameField().should('have.value', 'files').clear()
    cy.get('[name=name]').type('files')
    cy.contains('Save').click()

    // adding a field in review form
    cy.get('[title="Add a field..."]').click()
    cy.getByDataTestId('fieldType').click()
    cy.get('[class*="MenuList"]')
      .contains('Attachments')
      .scrollIntoView()
      .click()
    cy.getByDataTestId('title').click().type('More attachments')
    cy.get('[name=name]').click().type('moreAttachments')
    cy.contains('Save').click()

    // for decision field
    Menu.clickSettings()
    cy.contains('Decision').click()
    FormsPage.getFormTitleTab(0).should('contain', 'Decision')
    FormsPage.clickFormOption(1)
    FormsPage.getNameField().should('have.value', 'files').clear()
    cy.get('[name=name]').type('files')
    cy.contains('Save').click()

    // adding a field in decision form
    cy.get('[title="Add a field..."]').click()
    cy.getByDataTestId('fieldType').click()
    cy.contains('DOI suffix').click()
    cy.contains('Save').click()
  })
})
