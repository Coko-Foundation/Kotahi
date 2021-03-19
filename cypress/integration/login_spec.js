import { DashboardPage } from "../page-object/dashboard-page"
import { Menu } from "../page-object/page-component/menu"

describe('Login test', () => {
  it('Can log in as admin (and logout)', () => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'initialState');
    
    // login as admin and validate admin is logedin
    cy.fixture("role_names").then(name => {
      cy.task('createToken', name.role.admin).then(token => {
        cy.setToken(token);
        cy.visit('/kotahi/dashboard');
      });

      Menu.getLoggedUserButton().should('contain', name.role.admin);
      Menu.getDashboardButton().should('be.visible');
      Menu.getLoggedUserButton().should('contain', 'admin');

      DashboardPage.getSectionPlaceholder(0).should('contain', 'You have not submitted any manuscripts yet');
    });
  });
});