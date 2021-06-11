/// <reference types="Cypress" />
/**
 * Page object representing the list of published articles.
 */
const PUBLICATION_TITLE = 'General__Title'

// eslint-disable-next-line import/prefer-default-export
export const PublicationPage = {
  getPublicationTitle() {
    return cy.getByContainsClass(PUBLICATION_TITLE).invoke('text')
  },
}
