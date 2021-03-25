import { ManuscriptsPage } from '../../page-object/manuscripts-page'
import { Menu } from '../../page-object/page-component/menu'

describe('Manuscripts page tests', () => {

    //check the button is visible
    it('check button is visible', () => {
        // task to restore the database as per the  dumps/initialState.sql
        cy.task('restore', 'initialState')
        // login as admin
        cy.fixture('role_names').then(name => {
            cy.login(name.role.admin) // Senior editor
        })

        // check submit button is visible
        Menu.clickManuscripts()
        ManuscriptsPage.getSubmitButton().should('be.visible')
    })
})
