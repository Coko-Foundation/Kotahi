/* eslint-disable jest/expect-expect */
import { dashboard } from '../../support/routes'
import { Menu } from '../../page-object/page-component/menu'
import { ReportPage } from '../../page-object/reports-page'

describe.skip('Report Page', () => {
  it('Admin views and interacts with the reports page', () => {
    const restoreUrl = Cypress.config('restoreUrl')
    const seedUrl = Cypress.config('seedUrl')

    cy.request('POST', `${restoreUrl}/commons.bootstrap`)
    cy.request('POST', `${seedUrl}/three_reviews_completed`)

    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.admin, dashboard)
    })

    /* Group Manager can access the Reports */
    Menu.getReportsButton().should('be.visible')
    Menu.clickReports()

    /* Apply date range filter */
    ReportPage.getFromDateInput(1).clear().type('2021')
    ReportPage.getFromDateInput(2).clear().type('07')
    ReportPage.getFromDateInput(3).clear().type('01')

    /* Select and View each report table from the dropdown menu */
    ReportPage.getReportTypeDropDown().select('Editor') // Open Editor Report Page
    ReportPage.getReportTypeDropDown().select('Author') // Open Author Report Page
    ReportPage.getReportTypeDropDown().select('Manuscript') // Manuscript Report Page

    /* Manuasripts Table > Reviewers column */
    ReportPage.getReviewerRecords().should('have.length', 6) // Total Reviews: 6
    ReportPage.getCompletedSvg().should('have.length', 3) // Completed Reviews: 3
    ReportPage.getInvitedSvg().should('have.length', 1) // Invited Reviewers: 1
    ReportPage.getRejectedSvg().should('have.length', 1) // Rejected Invitation: 1
    ReportPage.getAcceptedSvg().should('have.length', 1) // Accepted Invitation: 1

    /* Reviewer Report Page */
    ReportPage.getReportTypeDropDown().select('Reviewer')

    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('report_data').then(({ reviewersData }) => {
      reviewersData.forEach((reviewer, length) => {
        // WARNING: Some of the tests for features are disabled as they're not working in the current state of Kotahi
        // TODO: Uncomment the features as soon as they're fixed
        const {
          // reviewerName,
          reviewInvites,
          invitesDeclined,
          reviewsCompleted,
          averageReviewDuration,
          // recommendedToAccept,
          // recommendedToRevise,
          // recommendedToReject,
        } = reviewer

        const i = length + 1 // skip the heading row

        // ReportPage.getReviewerName(i).should('have.text', reviewerName)
        ReportPage.getReviewInvites(i).should('have.text', reviewInvites)
        ReportPage.getInvitesDeclined(i).should('have.text', invitesDeclined)
        ReportPage.getReviewsCompleted(i).should('have.text', reviewsCompleted)
        ReportPage.getAverageReviewDuration(i).should(
          'have.text',
          averageReviewDuration,
        )
        /* ReportPage.getRecommendedToAccept(i).should(
          'have.text',
          recommendedToAccept,
        )
        ReportPage.getRecommendedToRevise(i).should(
          'have.text',
          recommendedToRevise,
        )
        ReportPage.getRecommendedToReject(i).should(
          'have.text',
          recommendedToReject,
        ) */
      })
    })
  })
})
