/// <reference types="Cypress" />
/**
 * Page object representing the article review page,
 * where reviewers can leave comments, approve or reject the article.
 */
const REVIEW_METADATA_CELL = 'ReviewMetadata__Cell';
const REVIEW_COMMENT_FIELD = 'reviewComment';
const CONFIDENTIAL_COMMENT_FIELD = 'confidentialComment';
const ACCEPT_RADIO_BUTTON = 'span[color=green]';
const SUBMIT_BUTTON = '[class*=General__SectionAction] > button';

export const ReviewPage = {
    getReviewMetadataCell(nth) {
        return cy.getByContainsClass(REVIEW_METADATA_CELL).eq(nth);
    },
    getReviewCommentField() {
        return cy.getByDataTestId(REVIEW_COMMENT_FIELD);
    },
    fillInReviewComment(reviewComment) {
        this.getReviewCommentField().fillInput(reviewComment)
    },
    getConfidentialCommentField() {
        return cy.getByDataTestId(CONFIDENTIAL_COMMENT_FIELD);
    },
    fillInConfidentialComment(confidentialComment) {
        this.getConfidentialCommentField().fillInput(confidentialComment);
    },
    getAcceptRadioButton() {
        return cy.get(ACCEPT_RADIO_BUTTON);
    },
    clickAccept() {
        this.getAcceptRadioButton().click();
    },
    getSubmitButton() {
        return cy.get(SUBMIT_BUTTON);
    },
    clickSubmit() {
        this.getSubmitButton().click();
    }
}