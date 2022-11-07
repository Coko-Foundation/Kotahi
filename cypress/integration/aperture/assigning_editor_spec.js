/* eslint-disable no-unused-vars */
/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */
import { Menu } from '../../page-object/page-component/menu'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { ControlPage } from '../../page-object/control-page'
import { dashboard } from '../../support/routes'

describe('Assigning senior editor', () => {
  it('admin can give decision', () => {
    cy.task('restore', 'commons/bootstrap')
    cy.task('seed', 'submission_complete') // task to restore the database as per the  dumps/submission_complete.sql
    cy.task('seedForms')

    cy.fixture('submission_form_data').then(data => {
      cy.fixture('role_names').then(name => {
        // login as admin
        cy.login(name.role.admin.name, dashboard)

        // select Control on the Manuscripts page
        Menu.clickManuscripts()

        ManuscriptsPage.selectOptionWithText('Control')

        // assign seniorEditor
        ControlPage.clickAssignSeniorEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.seniorEditor.username)

        ControlPage.clickAssignHandlingEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.seniorEditor.username)

        ControlPage.clickAssignEditorDropdown()
        ControlPage.selectDropdownOptionByName(name.role.admin.username)

        // assert the reviews
        ControlPage.fillInDecision(data.decision)
        ControlPage.clickAccept()
        ControlPage.clickSubmit()
      })
    })

    cy.contains('Dashboard').click()
  })
})
