/* eslint-disable prettier/prettier,jest/valid-expect-in-promise,jest/valid-expect */
/* eslint-disable jest/expect-expect */

import { dashboard } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { Menu } from '../../page-object/page-component/menu'
import { DashboardPage } from '../../page-object/dashboard-page'
import { ControlPage } from '../../page-object/control-page'

describe('email notification tests', () => {
    beforeEach(() => {
        cy.task('restore', 'initial_state_other')
        cy.task('seedForms')
        // login as admin
        // eslint-disable-next-line jest/valid-expect-in-promise
        cy.fixture('role_names').then(name => {
            cy.login(name.role.admin, dashboard)
        })
        cy.awaitDisappearSpinner()
        DashboardPage.clickSubmit()
        NewSubmissionPage.clickSubmitUrlAndWaitPageLoad()
        Menu.clickManuscriptsAndAssertPageLoad()
        ManuscriptsPage.clickControlAndVerifyPageLoaded()
        ControlPage.getEmailNotificationSection().should('be.visible')
    })
    it('email notification elements should be visible', () => {
        ControlPage.getNewUserCheckbox().should('be.visible')
        ControlPage.getEmailNotificationDropdowns().its('length').should('eq', 2)
        ControlPage.getEmailNotificationDropdowns().eq(0).should('be.visible')
        ControlPage.getEmailNotificationDropdowns().eq(1).should('be.visible')
        ControlPage.getNotifyButton().should('be.visible')
        ControlPage.clickNewUser()
        ControlPage.getNewUserEmailField().should('be.visible')
        ControlPage.getNewUserNameField().should('be.visible')
        ControlPage.getEmailNotificationDropdowns().its('length').should('eq', 3)
        ControlPage.getNotifyButton().should('be.visible')
    })
    it('only users who have their email saved can be selected from the dropdown', () => {
        ControlPage.clickEmailNotificationNthDropdown(0)
        cy.fixture('role_names').then(name => {
            ControlPage.getDropdownOptionList().its('length').should('eq', 3)
            ControlPage.getDropdownOptionList().should('contain', name.role.admin).and('contain', name.role.reviewers.reviewer1).and('contain', name.role.reviewers.reviewer2)
        })
    })
    it('two types of notification should be available', () => {
        ControlPage.clickEmailNotificationNthDropdown(-1)
        ControlPage.getDropdownOptionList().its('length').should('eq', 2)
        cy.fixture('submission_form_data').then(data => {
            ControlPage.getDropdownOptionList().should('contain', data.authorAcceptanceNotification)
            ControlPage.getDropdownOptionList().should('contain', data.evaluationCompleteNotification)
        })
    })
    it('check author acceptance notification request status is 200', () => {
        ControlPage.clickEmailNotificationNthDropdown(0)
        cy.fixture('role_names').then(name => {
            ControlPage.selectDropdownOptionByName(name.role.admin)
        })
        cy.intercept('POST', '/graphql').as('graphql')
        ControlPage.clickEmailNotificationNthDropdown(1)
        cy.fixture('submission_form_data').then(data => {
            ControlPage.selectDropdownOptionByName(data.authorAcceptanceNotification)
        })
        ControlPage.getNotifyButton()
        ControlPage.clickNotify()
        cy.wait('@graphql').then(response => {
            expect(response.response.body.data.sendEmail).to.have.property('success', true)
            expect(response.response.statusCode).to.eq(200)
        })
    })
    it('check evaluation complete notification request status is 200', () => {
        ControlPage.clickEmailNotificationNthDropdown(0)
        cy.fixture('role_names').then(name => {
            ControlPage.selectDropdownOptionByName(name.role.admin)
        })
        cy.intercept('POST', '/graphql').as('graphql')
        ControlPage.clickEmailNotificationNthDropdown(1)
        cy.fixture('submission_form_data').then(data => {
            ControlPage.selectDropdownOptionByName(data.evaluationCompleteNotification)
        })
        ControlPage.getNotifyButton()
        ControlPage.clickNotify()
        cy.wait('@graphql').then(response => {
            expect(response.response.body.data.sendEmail).to.have.property('success', true)
            expect(response.response.statusCode).to.eq(200)
        })
    })
    it('check new user author acceptance notification request status is 200', () => {
        ControlPage.clickNewUser(0)
        cy.fixture('role_names').then(name => {
            ControlPage.fillInNewUserName(name.role.admin)
            ControlPage.fillInNewUserEmail('test@123.com')
        })
        cy.intercept('POST', '/graphql').as('graphql')
        ControlPage.clickEmailNotificationNthDropdown(-1)
        cy.fixture('submission_form_data').then(data => {
            ControlPage.selectDropdownOptionByName(data.authorAcceptanceNotification)
        })
        ControlPage.getNotifyButton()
        ControlPage.clickNotify()
        cy.wait('@graphql').then(response => {
            expect(response.response.body.data.sendEmail).to.have.property('success', true)
            expect(response.response.statusCode).to.eq(200)
        })
    })
    it('check new user evaluation complete notification request status is 200', () => {
        ControlPage.clickNewUser(0)
        cy.fixture('role_names').then(name => {
            ControlPage.fillInNewUserName(name.role.admin)
            ControlPage.fillInNewUserEmail('test@123.com')
        })
        cy.intercept('POST', '/graphql').as('graphql')
        ControlPage.clickEmailNotificationNthDropdown(-1)
        cy.fixture('submission_form_data').then(data => {
            ControlPage.selectDropdownOptionByName(data.evaluationCompleteNotification)
        })
        ControlPage.getNotifyButton()
        ControlPage.clickNotify()
        cy.wait('@graphql').then(response => {
            expect(response.response.body.data.sendEmail).to.have.property('success', true)
            expect(response.response.statusCode).to.eq(200)
        })
    })
})
