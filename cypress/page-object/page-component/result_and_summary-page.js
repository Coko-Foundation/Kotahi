/// <reference types="Cypress" />
/**
 * Page object which represents the results and summary
 */

const CONTAINER = '[class*=General__Container]'
const HEADING = 'style__Heading'
const EVALUATION_TYPE = '[class*=General__Container] > p'
const REVIEW = '[class*=style__ArticleEvaluation] > p'

export const ResultAndSummaryPage = {
  getContainer() {
    return cy.get(CONTAINER, { timeout: 15000 })
  },
  getDescription() {
    return cy.getByContainsClass(HEADING).find('h2')
  },
  getEvaluationType() {
    return cy.get(EVALUATION_TYPE)
  },
  getReview() {
    return cy.get(REVIEW)
  },
  getLinkToOriginalArticle() {
    return cy.contains('link to original article')
  },
  getDate() {
    return cy.getByContainsClass(HEADING).find('span')
  },
}
export default ResultAndSummaryPage
