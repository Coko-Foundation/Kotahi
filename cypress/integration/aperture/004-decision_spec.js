import { ControlPage } from "../../page-object/control-page"
import { DashboardPage } from "../../page-object/dashboard-page"

describe('Completing a review', () => {
  it('accept and do a review', () => {
    // task to restore the database as per the  dumps/three_reviews_completed.sql
    cy.task('restore', 'three_reviews_completed');
    
    //login as seniorEditor and complete review
    cy.fixture("role_names").then(name => {
      cy.login(name.role.seniorEditor);

      DashboardPage.clickControlPanel();

      ControlPage.clickAndBlurDecisionComment();
      // Validations run on blur
      ControlPage.getErrorText().should('contain', 'Decision letter is required');
      ControlPage.clickDecisionComment();
      ControlPage.fillInDecisionComment('Great paper, dear authors, congratulations!');
      ControlPage.clickAccept();
      ControlPage.clickSubmit();
      ControlPage.getFormStatus().should('contain', 'Your decision has been saved.');

      cy.visit('/kotahi/dashboard');

      DashboardPage.getAcceptedAndPublishedButton().should('contain', 'Accepted');
      DashboardPage.getCompletedReviewsButton().should('have.text', '3completed');
    });

    // task to dump data in dumps/decision_completed.sql
    cy.task('dump', 'decision_completed');
  });
});