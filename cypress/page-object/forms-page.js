/// <reference types="Cypress" />
/**
 * Page object representing the second option from the left side menu,
 * which contains a number of options & fields to fill in / dropdowns.
 */
const FORM_TITLE_TAB = '[data-test-id="tab-container"] > div';
const FORM_OPTION_LIST = '[class*=FormBuilder__Element] > button:nth-child(1)';
const NAME_FIELD = 'name';
const COMPONENT_TYPE = '[role=listbox]'
const FIELD_VALIDATE = '[class*=react-select__value-container]'

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


    getFormBuilderElementName(nth) {
        return cy.get(FORM_OPTION_LIST).eq(nth)
    },
    getNameField() {
        return cy.getByName(NAME_FIELD);
    },
    getComponentType() {
        return cy.get(COMPONENT_TYPE);
    },
    getFieldValidate() {
        return cy.get(FIELD_VALIDATE)
    }
}
