/// <reference types="Cypress" />
/**
 * Page component representing the fourth option in the left side menu,
 * where users can see the list of submitted manuscripts & select Control,
 * View or Delete.
 */
const MANUSCRIPTS_OPTIONS_LIST = '[class*=Table__LastCell] > a';
const BUTTON = 'button';

export const ManuscriptsPage = {
    getManuscriptsOptionsList() {
        return cy.get(MANUSCRIPTS_OPTIONS_LIST);
    },
    selectOptionWithText(text) {
        this.getManuscriptsOptionsList().contains(text).click();
    },
    getSubmitButton() {
        return cy.get(BUTTON).contains('New submission');
    },
    clickSubmit() {
        this.getSubmitButton().click();
    }
}