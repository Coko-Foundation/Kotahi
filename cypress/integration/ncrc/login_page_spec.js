/* eslint-disable jest/expect-expect */
import { Menu } from '../../page-object/page-component/menu'
import {
  dashboard,
  formBuilder,
  login,
  manuscripts,
  users,
} from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { LoginPage } from '../../page-object/login-page'
import { DashboardPage } from '../../page-object/dashboard-page'

describe('Login page tests', () => {
  it('page should display NCRC branding settings', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('branding_settings').then(settings => {
      cy.visit(login)

      LoginPage.getBackground().should('be.visible')
      LoginPage.getLogo().should('be.visible')
      LoginPage.getLoginButton().should('be.visible')
      // assert settings are specific to eLife instance
      LoginPage.getBackground()
        .should('have.css', 'background-image')
        .and('contains', settings.ncrc.primaryColor)
      LoginPage.getLogo()
        .should('have.attr', 'alt')
        .and('eq', settings.ncrc.brandName)
      LoginPage.getLogo()
        .should('have.attr', 'src')
        .and('eq', settings.ncrc.logoPath)
      LoginPage.getLoginButton()
        .should('have.css', 'background-color')
        .and('contains', settings.ncrc.primaryColor)
    })
  })
  it('branding settings should be visible after login', () => {
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('branding_settings').then(settings => {
      // task to restore the database as per the  dumps/initialState.sql
      cy.task('restore', 'initial_state_ncrc')
      cy.task('seedForms')

      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, manuscripts)
      })
      cy.awaitDisappearSpinner()

      Menu.getBackground()
        .should('have.css', 'background-image')
        .and('contains', settings.ncrc.primaryColor)

      ManuscriptsPage.getCreatedCaret(0)
        .should('have.css', 'color')
        .and('eq', settings.ncrc.primaryColor)
      ManuscriptsPage.getCreatedCaret(1)
        .should('have.css', 'color')
        .and('eq', settings.ncrc.primaryColor)
      ManuscriptsPage.getSubmitButton()
        .should('have.css', 'background-color')
        .should('contain', settings.ncrc.primaryColor)
    })
  })

  it('dashboard page should be visible to the logged in user', () => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'initial_state_ncrc')
    cy.task('seedForms')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, manuscripts)
    })
    cy.awaitDisappearSpinner()
    Menu.getDashboardButton().should('be.visible')
  })
  it('login as Reviewer/Editor', () => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'initial_state_ncrc')
    cy.task('seedForms')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers.reviewer1, dashboard)
    })
    cy.awaitDisappearSpinner()
    Menu.getDashboardButton().should('be.visible')
    DashboardPage.getSectionTitleWithText("Manuscripts I'm editor of").should(
      'be.visible',
    )
    Menu.getFormsButton().should('not.exist')
    Menu.getUsersButton().should('not.exist')
    Menu.getManuscriptsButton().should('not.exist')
    Menu.getMyProfileButton().should('be.visible')
  })
  it('as Reviewer/Editor try to acees the admin-specific pages', () => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'initial_state_ncrc')
    cy.task('seedForms')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers.reviewer1, users)
    })
    cy.awaitDisappearSpinner()
    Menu.getDashboardButton().should('be.visible')
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
    cy.visit(manuscripts)
    cy.awaitDisappearSpinner()
    Menu.getMessageNotAuthorisedUser().should(
      'contain',
      'Error! Not Authorised!',
    )
  })
})
