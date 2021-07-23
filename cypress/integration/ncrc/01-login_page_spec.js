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
import { UsersPage } from '../../page-object/users-page'
import { FormsPage } from '../../page-object/forms-page'

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
      // task to restore the database as per the dumps/initial_state_other.sql
      cy.task('restore', 'initial_state_other')
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
    // task to restore the database as per the dumps/initial_state_other.sql
    cy.task('restore', 'initial_state_other')
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
    // task to restore the database as per the dumps/initial_state_other.sql
    cy.task('restore', 'initial_state_other')
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
  it('as Reviewer/Editor try to access the admin-specific pages', () => {
    // task to restore the database as per the dumps/initial_state_other.sql
    cy.task('restore', 'initial_state_other')
    cy.task('seedForms')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.reviewers.reviewer1, users)
    })
    cy.awaitDisappearSpinner()
    UsersPage.getTitle().should('not.exist')
    UsersPage.getDeleteButton().should('not.exist')
    cy.visit(formBuilder)
    cy.awaitDisappearSpinner()
    FormsPage.getFormOptionList().should('not.exist')
    cy.visit(manuscripts)
    cy.awaitDisappearSpinner()
    ManuscriptsPage.getTableHeader().should('not.exist')
    ManuscriptsPage.getLiveChatButton().should('not.exist')
  })
  it('reports option should be visible to the admin user', () => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'initial_state_other')
    cy.task('seedForms')

    // login as admin
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })
    cy.awaitDisappearSpinner()
    Menu.getReportsButton().should('be.visible')
  })
})
