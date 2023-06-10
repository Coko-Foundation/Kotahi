/* eslint-disable jest/expect-expect */
import { ControlPage } from '../../page-object/control-page'
import { Menu } from '../../page-object/page-component/menu'
import { dashboard } from '../../support/routes'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Email Notification Tests', () => {
  it('can send existing user email notifications', () => {
    cy.task('restore', 'email_notification')
    cy.task('seedForms')

    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      // login as seniorEditor
      cy.login(name.role.seniorEditor, dashboard)

      // select Control on the Manuscripts page
      Menu.clickManuscripts()
      ManuscriptsPage.selectOptionWithText('Control')
      cy.contains('Tasks & Notifications').click()

      /* Existing User */
      // Choose Recievers Dropdown
      ControlPage.getEmailNotificationDropdowns()
        .eq(0)
        .type('Emily{enter}', { delay: 200 })
      // cy.contains('Emily Clay').click()

      // Choose Invitation Template Dropdown
      ControlPage.getEmailNotificationDropdowns()
        .eq(1)
        .type('Author Invitation{enter}')

      cy.contains('Notify').click()

      /* Verify Notification in Editorial Discussion Panel */
      ControlPage.clickNthChatTab(1)

      ControlPage.getMessageContainer().should(
        'contain',
        'Author Invitation Email Template sent by Elaine Barnes to Emily Clay',
      )

      /* New User */
      cy.contains('New User').click()

      cy.get('[data-cy="new-user-email"]').type('jon@example.co')
      cy.get('[data-cy="new-user-name"]').type('Jon')

      ControlPage.getEmailNotificationDropdowns()
        .eq(2)
        .type('Author Invitation{enter}')

      cy.contains('Notify').click()

      ControlPage.clickNthChatTab(1)

      ControlPage.getMessageContainer().should(
        'contain',
        'Author Invitation Email Template sent by Elaine Barnes to Jon',
      )
    })
  })
})
