/// <reference types="Cypress" />
import { submit } from '../support/routes'
import { SubmissionFormPage } from './submission-form-page'

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
  clickSubmitUrlAndWaitPageLoad() {
    this.clickSubmitURL()
    cy.url({ timeout: 30000 }).should('contain', submit)
    cy.awaitDisappearSpinner()
    SubmissionFormPage.getPageTitle().should('be.visible')
  },
  getSubmissionMessage() {
    return cy.get(SUBMISSION_MESSAGE).invoke('text')
  },
}

export default NewSubmissionPage
