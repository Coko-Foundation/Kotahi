import { ControlPage } from "../../page-object/control-page"
import { DashboardPage } from "../../page-object/dashboard-page"
import { Menu } from "../../page-object/page-component/menu"
import { ReviewersPage } from "../../page-object/reviewers-page"
// const login = name => {
//   cy.task('createToken', name).then(token => {
//     cy.setToken(token)
//     cy.visit('/journal/dashboard')
//   })
// }

describe('Editor assigning reviewers', () => {
  it('can assign 3 reviewers', () => {
    // task to restore the database as per the  dumps/senior_editor_assigned.sql
    cy.task('restore', 'senior_editor_assigned');

    cy.fixture("role_names").then(name => {
      // login as seniorEditor
      cy.login(name.role.seniorEditor);

      // go to control page and assign 3 reviewers
      DashboardPage.clickControlPanel();

      ControlPage.clickManageReviewers();

      ReviewersPage.clickInviteReviewerDropdown();
      // Invite first reviewer'Gale Davis'
      ReviewersPage.inviteReviewer(name.role.reviewers.reviewer1);
      ReviewersPage.getNumberOfInvitedReviewers().should('eq', 1);
      // 2nd 'Sherry Crofoot'
      ReviewersPage.clickInviteReviewerDropdown();
      ReviewersPage.inviteReviewer(name.role.reviewers.reviewer2);
      ReviewersPage.getInvitedReviewersList().should('have.length', 2);
      // 3rd 'Elaine Barnes'
      ReviewersPage.clickInviteReviewerDropdown();
      ReviewersPage.inviteReviewer(name.role.reviewers.reviewer3);
      ReviewersPage.getInvitedReviewersList().should('have.length', 3);

      // go to dashboard and assert number of invited reviewer
      Menu.clickDashboard();

      DashboardPage.getInvitedReviewersButton().should('have.text', '3invited');
    });
    
    // task to dump data in dumps/reviewers_invited.sql
    cy.task('dump', 'reviewers_invited');
  });
});