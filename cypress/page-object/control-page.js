/// <reference types="Cypress" />
/**
 * Page object representing the Control page,
 * which can be accessed either through the Dashboard page
 * ('Manuscripts I'm editor of' section)
 * or through the Manuscripts page.
 */
const MANAGE_REVIEWERS_BUTTON = '[class*=General__SectionRow] > a';
const DECISION_COMMENT_FIELD = 'decisionComment';
const PUBLISH_BUTTON = '[class*=General__SectionAction] > button[type=button]';
const PUBLISH_INFO_MESSAGE = 'General__SectionActionInfo';
const ASSIGN_EDITOR_DROPDOWN = 'Assign seniorEditor';
const EDITOR_OPTION_LIST = '[class*=MenuList] > [id*=option]';
const METADATA_CELL = 'ReviewMetadata__Cell';

export const ControlPage = {
    getManageReviewersButton() {
        return cy.get(MANAGE_REVIEWERS_BUTTON);
    },
    clickManageReviewers() {
        this.getManageReviewersButton().click();
    },
    getDecisionCommentField() {
        return cy.getByTestDataId(DECISION_COMMENT_FIELD);
    },
    clickDecisionComment() {
        this.getDecisionCommentField().click();
    },
    getPublishButton() {
        return cy.get(PUBLISH_BUTTON);
    },
    clickPublish() {
        this.getPublishButton().click();
    },
    getPublishInfoMessage() {
        return cy.getByContainsClass(PUBLISH_INFO_MESSAGE).invoke('text');
    },
    getAssignEditorDropdown() {
        return cy.getByContainsAreaLabel(ASSIGN_EDITOR_DROPDOWN);
    },
    clickAssignEditorDropdown() {
        this.getAssignEditorDropdown().click({force: true});
    },
    getEditorOptionList() {
        return cy.get(EDITOR_OPTION_LIST);
    },
    selectEditorByName(name) {
        this.getEditorOptionList().contains(name).click();
    },
    getMetadataCell(nth) {
        return cy.getByContainsClass(METADATA_CELL).eq(nth);
    }
}