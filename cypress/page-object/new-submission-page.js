/// <reference types="Cypress" />
import { submit } from '../support/routes'

/**
 * Page object representing the available submission options:
 * submission through uploading a manuscript or through using an URL.
 */
const UPLOAD_MANUSCRIPT_BUTTON = 'UploadManuscript__Info'
const SUBMIT_URL_BUTTON = 'button'
const SUBMISSION_MESSAGE = 'body'

export const NewSubmissionPage = {
  getUploadManuscriptButton() {
    return cy.getByContainsClass(UPLOAD_MANUSCRIPT_BUTTON)
  },
  clickUploadManuscript() {
    this.getUploadManuscriptButton().click()
  },
  getSubmitURLButton() {
    return cy.get(SUBMIT_URL_BUTTON)
  },
  clickSubmitURL() {
    this.getSubmitURLButton().click()
  },
  clickSubmitUrlAndVerifyLink() {
    this.clickSubmitURL()
    cy.url({ timeout: 15000 }).should('contain', submit)
  },
  getSubmissionMessage() {
    return cy.get(SUBMISSION_MESSAGE).invoke('text')
  },
}

export default NewSubmissionPage
