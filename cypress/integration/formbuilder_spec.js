import { FormsPage } from "../page-object/forms-page"
import { Menu } from "../page-object/page-component/menu"

describe('Form builder', () => {
  it('views a form field', () => {
     // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'initialState');

    //login as admin
    cy.fixture("role_names").then(name => {
      cy.login(name.role.admin) // Senior editor
    });

    //enter the from page and assert the fileds
    Menu.clickForms();

    FormsPage.getFormTitleTab(0).should('contain', 'Research Object Submission Form');
    FormsPage.clickFormOption(1);
    FormsPage.getNameField().should('have.value', 'submission.name');
  });
});