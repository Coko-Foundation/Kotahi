/// <reference types="Cypress" />
/**
 * Page object representing the last option in the left side menu,
 * containing the logout option(index 0), change profile picture option (index 1)
 * & change username option (index 2).
 */
const BUTTON = 'button';
const USERNAME_FIELD = '[class*=ChangeUsername] > input';

export const ProfilePage = {
    getButtonByIndex(nth) {
        return cy.get(BUTTON).eq(nth);
    },
    getUsernameField() {
        return cy.get(USERNAME_FIELD);
    },
    changeUsername(username) {
        this.getUsernameField().fillInput(username);
    }
}