/// <reference types="Cypress" />
/**
 * Page object representing the third option in the left side menu,
 * where the list of users is displayed & the admin is able to delete users.
 */
const TITLE = 'General__Heading';
const USER_TABLE_ROW_LIST = 'Table__Row';
const DELETE_USER_BUTTON = '[class*=Table__Cell] > button';

export const UsersPage = {
    getTitle() {
        return cy.getByContainsClass(TITLE);
    },
    getUserTableRowList() {
        return cy.getByContainsClass(USER_TABLE_ROW_LIST);
    },
    getDeleteButton() {
        return cy.get(DELETE_USER_BUTTON);
    }
}