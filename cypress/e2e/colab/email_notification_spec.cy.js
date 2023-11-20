/* eslint-disable jest/expect-expect */
import { ControlPage } from '../../page-object/control-page'
import { Menu } from '../../page-object/page-component/menu'
import { dashboard } from '../../support/routes1'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'

// eslint-disable-next-line jest/no-disabled-tests
describe('Email Notification Tests', () => {
  it('can send existing user email notifications', () => {
    cy.task('restore', 'email_notification')

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

      ControlPage.clickExpandChatButton()

      /* Verify Notification in Editorial Discussion Panel */
      ControlPage.clickNthChatTab(1)

      ControlPage.getMessageContainer().should(
        'contain',
        'Author Invitation sent by Elaine Barnes to Emily Clay',
      )

      /* New User */
      cy.get('input[type="checkbox"]:last').click({ force: true })

      cy.get('[data-cy="new-user-email"]').type('jon@example.co')
      cy.get('[data-cy="new-user-name"]').type('Jon')

      ControlPage.getEmailNotificationDropdowns()
        .eq(2)
        .type('Author Invitation{enter}')

      cy.contains('Notify').click()

      ControlPage.clickNthChatTab(1)

      ControlPage.getMessageContainer().should(
        'contain',
        'Author Invitation sent by Elaine Barnes to Jon',
      )
    })
  })
})
