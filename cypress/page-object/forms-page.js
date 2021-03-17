/// <reference types="Cypress" />
/**
 * Page object representing the second option from the left side menu,
 * which contains a number of options & fields to fill in / dropdowns.
 */
const FORM_TITLE_TAB = '[data-test-id="tab-container"] > div';
const FORM_OPTION_LIST = '[class*=FormBuilder__Element] > button';
const NAME_FIELD = 'name';

export const FormsPage = {
    getFormTitleTab(nth) {
        return cy.get(FORM_TITLE_TAB).eq(nth);
    },
    getFormTitleText(nth) {
        this.getFormTitleTab(nth).invoke('text');
    },
    getFormOptionList() {
        return cy.get(FORM_OPTION_LIST);
    },
    clickFormOption(nth) {
        this.getFormOptionList().eq(nth).click();
    },
    getNameField() {
        return cy.getByName(NAME_FIELD);
    }
}
