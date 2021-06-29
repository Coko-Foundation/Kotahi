/* eslint-disable jest/valid-expect-in-promise,jest/expect-expect */
/// <reference types="Cypress" />
import {
  users,
  dashboard,
  formBuilder,
  manuscripts,
} from '../../support/routes'
import { UsersPage } from '../../page-object/users-page'
import { Menu } from '../../page-object/page-component/menu'
import { FormsPage } from '../../page-object/forms-page'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'

describe('users page tests', () => {
  beforeEach(() => {
    // task to restore the database as per the dumps/initial_state_ncrc.sql
    cy.task('restore', 'initial_state_ncrc')
    cy.task('seedForms')

    // login as admin
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, users)
    })
    cy.awaitDisappearSpinner()
  })

  context('visibility check', () => {
    it('button to switch user roles should be visible', () => {
      UsersPage.getMakeAdminReviewerButton()
        .its('length')
        .then(length => {
          // eslint-disable-next-line jest/valid-expect
          expect(length).to.be.eq(7)

          // eslint-disable-next-line no-plusplus
          for (let i = 0; i < 7; i++) {
            UsersPage.getMakeAdminReviewerButton()
              .eq(i)
              .scrollIntoView()
              .should('be.visible')
          }
        })
    })
  })

  context('functionality check', () => {
    it('reviewer can be set to admin', () => {
      cy.fixture('role_names').then(name => {
        UsersPage.getNthUserRow(0).should('contain', name.role.seniorEditor)
        UsersPage.getMakeAdminReviewerButton()
          .eq(0)
          .should('contain', 'Admin')
          .click()
        UsersPage.getAdminStatusByRow(0).should('contain', 'yes')
        cy.login(name.role.seniorEditor, dashboard)
        cy.awaitDisappearSpinner()
        Menu.getFormsButton().should('be.visible')
        Menu.getManuscriptsButton().should('be.visible')
        Menu.getUsersButton().should('be.visible')

        Menu.clickForms()
        cy.awaitDisappearSpinner()
        FormsPage.getFormTitleTab(0).should('be.visible')
        Menu.clickManuscriptsAndAssertPageLoad()
        ManuscriptsPage.getTableHeader().should('be.visible')
        Menu.clickUsers()
        cy.awaitDisappearSpinner()
        UsersPage.getTitle().should('be.visible')
      })
    })
    it('admin can be set to reviewer', () => {
      cy.fixture('role_names').then(name => {
        UsersPage.getNthUserRow(1).should('contain', name.role.tester)
        UsersPage.getMakeAdminReviewerButton()
          .eq(1)
          .should('contain', 'Reviewer')
          .click()
        UsersPage.getAdminStatusByRow(1).should('not.contain', 'yes')
        cy.login(name.role.tester, dashboard)
        cy.awaitDisappearSpinner()
        Menu.getFormsButton().should('not.exist')
        Menu.getManuscriptsButton().should('not.exist')
        Menu.getUsersButton().should('not.exist')

        cy.visit(manuscripts)
        cy.awaitDisappearSpinner()
        Menu.getMessageNotAuthorisedUser().should(
          'contain',
          'Error! Not Authorised!',
        )
        cy.visit(users)
        cy.awaitDisappearSpinner()
        Menu.getMessageNotAuthorisedUser().should(
          'contain',
          'Error! Not Authorised!',
        )
        cy.visit(formBuilder)
        cy.awaitDisappearSpinner()
        Menu.getMessageNotAuthorisedUser().should(
          'contain',
          'Error! Not Authorised!',
        )
      })
    })
  })
})
