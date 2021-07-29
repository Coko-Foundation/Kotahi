/* eslint-disable prettier/prettier,jest/valid-expect-in-promise,jest/valid-expect,cypress/no-unnecessary-waiting */
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
      ControlPage.getDropdownOptionList()
        .should('contain', name.role.admin)
        .and('contain', name.role.reviewers.reviewer1)
        .and('contain', name.role.reviewers.reviewer2)
    })
  })
  it('two types of notification should be available', () => {
    ControlPage.clickEmailNotificationNthDropdown(-1)
    ControlPage.getDropdownOptionList().its('length').should('eq', 2)
    cy.fixture('submission_form_data').then(data => {
      ControlPage.getDropdownOptionList().should(
        'contain',
        data.authorAcceptanceNotification,
      )
      ControlPage.getDropdownOptionList().should(
        'contain',
        data.evaluationCompleteNotification,
      )
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
    ControlPage.clickNotify()
    cy.wait('@graphql').then(response => {
      expect(response.response.body.data.sendEmail).to.have.property(
        'success',
        true,
      )
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
      ControlPage.selectDropdownOptionByName(
        data.evaluationCompleteNotification,
      )
    })
    ControlPage.clickNotify()
    cy.wait('@graphql').then(response => {
      expect(response.response.body.data.sendEmail).to.have.property(
        'success',
        true,
      )
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
    ControlPage.clickNotify()
    cy.wait('@graphql').then(response => {
      expect(response.response.body.data.sendEmail).to.have.property(
        'success',
        true,
      )
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
      ControlPage.selectDropdownOptionByName(
        data.evaluationCompleteNotification,
      )
    })
    ControlPage.clickNotify()
    cy.wait('@graphql').then(response => {
      expect(response.response.body.data.sendEmail).to.have.property(
        'success',
        true,
      )
      expect(response.response.statusCode).to.eq(200)
    })
  })
  it('check api response is false if email is incorrect', () => {
    ControlPage.clickNewUser(0)
    cy.fixture('role_names').then(name => {
      ControlPage.fillInNewUserName(name.role.admin)
      ControlPage.fillInNewUserEmail('test')
    })
    cy.intercept('POST', '/graphql').as('graphql')
    ControlPage.clickEmailNotificationNthDropdown(-1)
    cy.fixture('submission_form_data').then(data => {
      ControlPage.selectDropdownOptionByName(data.authorAcceptanceNotification)
    })
    ControlPage.clickNotify()
    cy.wait('@graphql').then(response => {
      expect(response.response.body.data.sendEmail).to.have.property(
        'success',
        false,
      )
    })
    ControlPage.clickEmailNotificationNthDropdown(-1)
    cy.fixture('submission_form_data').then(data => {
      ControlPage.selectDropdownOptionByName(
        data.evaluationCompleteNotification,
      )
    })
    ControlPage.clickNotify()
    cy.wait('@graphql').then(response => {
      expect(response.response.body.data.sendEmail).to.have.property(
        'success',
        false,
      )
    })
  })
  context('log notification events tests', () => {
    beforeEach(() => {
      ControlPage.clickNthChatTab(-1)
      ControlPage.getLogMessage().should('not.exist')
      ControlPage.clickEmailNotificationNthDropdown(0)
      cy.fixture('role_names').then(name => {
        ControlPage.selectDropdownOptionByName(name.role.admin)
        ControlPage.clickEmailNotificationNthDropdown(-1)
        cy.fixture('submission_form_data').then(data => {
          ControlPage.selectDropdownOptionByName(
            data.authorAcceptanceNotification,
          )
          ControlPage.clickNotify()
          ControlPage.clickEmailNotificationNthDropdown(1)
          ControlPage.selectDropdownOptionByName(
            data.evaluationCompleteNotification,
          )
          ControlPage.clickNotify()
          ControlPage.clickNewUser(0)
          ControlPage.fillInNewUserEmail('test@123.com')
          ControlPage.fillInNewUserName(data.creator)
          ControlPage.clickEmailNotificationNthDropdown(-1)
          ControlPage.selectDropdownOptionByName(
            data.authorAcceptanceNotification,
          )
          ControlPage.clickNotify()
          ControlPage.clickEmailNotificationNthDropdown(-1)
          ControlPage.selectDropdownOptionByName(
            data.evaluationCompleteNotification,
          )
          ControlPage.clickNotify()
        })
      })
    })
    it('the editor chat should display notifications for each notification sent', () => {
      cy.fixture('role_names').then(name => {
        cy.fixture('submission_form_data').then(data => {
          const timeNow = () => {
            const date = new Date()
            let month = date.getMonth()

            const monthArray = [
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ]

            month = monthArray[month]
            const day = date.getDate()
            const year = date.getFullYear()
            const hour = date.getHours()
            return `${month} ${day}, ${year} at ${hour}`
          }

          ControlPage.getLogMessage().should('have.length', 4)
          ControlPage.getLogMessage()
            .should('be.visible')
            .and('contain', `${timeNow()}`)
            .and(
              'contain',
              `${data.authorAcceptanceLog} ${name.role.admin} to ${name.role.admin}`,
            )
          ControlPage.getLogMessage()
            .should('be.visible')
            .and('contain', `${timeNow()}`)
            .and(
              'contain',
              `${data.evaluationCompleteLog} ${name.role.admin} to ${name.role.admin}`,
            )
          ControlPage.getLogMessage()
            .should('be.visible')
            .and('contain', `${timeNow()}`)
            .and(
              'contain',
              `${data.authorAcceptanceLog} ${name.role.admin} to ${data.creator}`,
            )
          ControlPage.getLogMessage()
            .should('be.visible')
            .and('contain', `${timeNow()}`)
            .and(
              'contain',
              `${data.evaluationCompleteLog} ${name.role.admin} to ${data.creator}`,
            )
        })
      })
    })
    it('other editors should see the notification logs', () => {
      cy.fixture('role_names').then(name => {
        ControlPage.clickAssignSeniorEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.reviewers.reviewer1)
        ControlPage.clickAssignSeniorEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.reviewers.reviewer2)
        cy.wait(3000)
        cy.login(name.role.reviewers.reviewer1, dashboard)
        cy.awaitDisappearSpinner()
        DashboardPage.clickControlPanel()
        ControlPage.clickNthChatTab(-1)
        ControlPage.getLogMessage().should('be.visible').and('have.length', 4)
        cy.login(name.role.reviewers.reviewer2, dashboard)
        cy.awaitDisappearSpinner()
        DashboardPage.clickControlPanel()
        ControlPage.clickNthChatTab(-1)
        ControlPage.getLogMessage().should('be.visible').and('have.length', 4)
      })
    })
    it('unsuccessful notifications should not trigger a log', () => {
      cy.fixture('submission_form_data').then(data => {
        ControlPage.fillInNewUserName(data.creator)
        ControlPage.fillInNewUserEmail('test')
        ControlPage.clickEmailNotificationNthDropdown(-1)
        ControlPage.selectDropdownOptionByName(
          data.authorAcceptanceNotification,
        )
        ControlPage.clickNotify()
        ControlPage.getLogMessage().should('have.length', 4)
        ControlPage.clickEmailNotificationNthDropdown(-1)
        ControlPage.selectDropdownOptionByName(
          data.evaluationCompleteNotification,
        )
        ControlPage.clickNotify()
        ControlPage.getLogMessage().should('have.length', 4)
      })
    })
    it('notification logs should not be visible in the author chat tab', () => {
      ControlPage.clickNthChatTab(0)
      ControlPage.getLogMessage().should('not.exist')
    })
    it('other editors can send notifications & see the new logs', () => {
      cy.fixture('role_names').then(name => {
        ControlPage.clickAssignSeniorEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.reviewers.reviewer1)
        ControlPage.clickAssignSeniorEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.reviewers.reviewer2)
        cy.wait(3000)
        cy.login(name.role.reviewers.reviewer1, dashboard)
        cy.awaitDisappearSpinner()
        DashboardPage.clickControlPanel()
        ControlPage.clickNthChatTab(-1)
        ControlPage.clickEmailNotificationNthDropdown(0)
        ControlPage.selectDropdownOptionByName(name.role.reviewers.reviewer2)
        ControlPage.clickEmailNotificationNthDropdown(-1)
        cy.fixture('submission_form_data').then(data => {
          ControlPage.selectDropdownOptionByName(
            data.authorAcceptanceNotification,
          )
          ControlPage.clickNotify()
          ControlPage.getLogMessage().should('be.visible').and('have.length', 5)
          ControlPage.getLogMessage()
            .should('be.visible')
            .and(
              'contain',
              `${data.authorAcceptanceLog} ${name.role.reviewers.reviewer1} to ${name.role.reviewers.reviewer2}`,
            )
          cy.login(name.role.reviewers.reviewer2, dashboard)
          cy.awaitDisappearSpinner()
          DashboardPage.clickControlPanel()
          ControlPage.clickNthChatTab(-1)
          ControlPage.clickEmailNotificationNthDropdown(0)
          ControlPage.selectDropdownOptionByName(name.role.reviewers.reviewer1)
          ControlPage.clickEmailNotificationNthDropdown(-1)
          ControlPage.selectDropdownOptionByName(
            data.evaluationCompleteNotification,
          )
          ControlPage.clickNotify()
          ControlPage.getLogMessage().should('be.visible').and('have.length', 6)
          ControlPage.getLogMessage()
            .should('be.visible')
            .and(
              'contain',
              `${data.evaluationCompleteLog} ${name.role.reviewers.reviewer2} to ${name.role.reviewers.reviewer1}`,
            )
        })
      })
    })
    it('only selecting / filling in one of the fields should not trigger a log', () => {
      cy.fixture('submission_form_data').then(data => {
        ControlPage.getLogMessage().should('have.length', 4)
        cy.reload()
        ControlPage.clickNthChatTab(-1)
        ControlPage.clickNewUser()
        ControlPage.fillInNewUserName(data.creator)
        ControlPage.clickEmailNotificationNthDropdown(-1)
        ControlPage.selectDropdownOptionByName(
            data.authorAcceptanceNotification,
        )
        ControlPage.clickNotify()
        ControlPage.getLogMessage().should('have.length', 4)
        cy.reload()
        ControlPage.clickNthChatTab(-1)
        ControlPage.clickNewUser()
        ControlPage.fillInNewUserEmail('test@123.com')
        ControlPage.clickEmailNotificationNthDropdown(-1)
        ControlPage.selectDropdownOptionByName(
            data.evaluationCompleteNotification,
        )
        ControlPage.clickNotify()
        ControlPage.getLogMessage().should('have.length', 4)
        cy.reload()
        ControlPage.clickNthChatTab(-1)
        ControlPage.clickEmailNotificationNthDropdown(0)
        cy.fixture('role_names').then(name => {
          ControlPage.selectDropdownOptionByName(name.role.admin)
          ControlPage.clickNotify()
          ControlPage.getLogMessage().should('have.length', 4)
          cy.reload()
          ControlPage.clickNthChatTab(-1)
          ControlPage.clickEmailNotificationNthDropdown(1)
          ControlPage.selectDropdownOptionByName(
                data.authorAcceptanceNotification,
            )
          ControlPage.clickNotify()
          ControlPage.getLogMessage().should('have.length', 4)
        })
      })
    })
  })
})
