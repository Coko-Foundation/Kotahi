/* eslint-disable no-unused-vars */
/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable jest/expect-expect */
import { Menu } from '../../page-object/page-component/menu'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { ControlPage } from '../../page-object/control-page'
import { dashboard } from '../../support/routes'


describe('Assigning senior editor', () => {
    it('admin can give decision', () => {
        // task to restore the database as per the  dumps/submission_complete.sql
        cy.task('restore', 'submission_complete')
        cy.task('seedForms')


        cy.fixture('submission_form_data').then(data => {
            cy.fixture('role_names').then(name => {
                // login as admin
                cy.login(name.role.admin, dashboard)

                // enter email
                cy.contains('Enter Email').click()
                cy.get('#enter-email').type('admin@gmail.com')

                // submit the email
                cy.contains('Next').click()

                // select Control on the Manuscripts page
                Menu.clickManuscripts()

                ManuscriptsPage.selectOptionWithText('Control')

                // assign seniorEditor
                ControlPage.clickAssignSeniorEditorDropdown()
                ControlPage.selectDropdownOptionByName(name.role.seniorEditor.uuid)
                ControlPage.clickAssignHandlingEditorDropdown()
                ControlPage.selectDropdownOptionByName(name.role.seniorEditor.uuid)
                ControlPage.clickAssignEditorDropdown()
                ControlPage.selectDropdownOptionByName(name.role.seniorEditor.uuid1)
                // assert the reviews
                ControlPage.fillInDecision(data.decision)
                ControlPage.clickAccept()
                ControlPage.clickSubmit()
            })
        })

        // task to dump data in dumps/senior_editor_assigned.sql
        cy.task('dump', 'senior_editor_assigned')

        cy.contains('Dashboard').click()
    })
})
