import { DashboardPage } from "../page-object/dashboard-page"
import { ReviewPage } from "../page-object/review-page"

//login as reviewer, accept and do review, leave comments and submit
const doReview = name => {
  cy.login(name);

  DashboardPage.clickAcceptReview();
  DashboardPage.clickDoReview();

  cy.fixture("submission_form_data").then(data => {
  ReviewPage.getReviewMetadataCell(3).should('contain', data.title);
  ReviewPage.getReviewMetadataCell(8).should('contain', data.dataCode);
  });

  ReviewPage.fillInReviewComment(`Great paper, congratulations! ${name}`);
  ReviewPage.fillInConfidentialComment(`This is a very important paper. ${name}`);
  ReviewPage.clickAccept();
  ReviewPage.clickSubmit();

  cy.visit('/kotahi/dashboard');

  DashboardPage.getDoReviewButton().should('contain', 'Completed');
};

describe('Completing a review', () => {
  it('accept and do a review', () => {
    cy.task('restore', 'reviewers_invited');
    cy.fixture("role_names").then(name => {
      // Reviewers
      doReview(name.role.reviewers.reviewer1);
      doReview(name.role.reviewers.reviewer2);
      doReview(name.role.reviewers.reviewer3);

      // login as seniorEditor and assert the 3 reviews are completed
      cy.login(name.role.seniorEditor);

      DashboardPage.getCompletedReviewsButton().should('have.text', '3completed');
    });

    // task to dump data in dumps/three_reviews_completed.sql
    cy.task('dump', 'three_reviews_completed');
  });
});