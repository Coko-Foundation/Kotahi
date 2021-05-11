/* eslint-disable jest/expect-expect */
import { ControlPage } from '../../page-object/control-page'
import { DashboardPage } from '../../page-object/dashboard-page'
import { Menu } from '../../page-object/page-component/menu'
import { PublicationPage } from '../../page-object/publication-page'
import { dashboard } from '../../support/routes'

describe('Publishing a submission', () => {
  it('publish an accepted submission', () => {
    cy.task('restore', 'decision_completed')
    cy.task('seedForms')

    // login as seniorEditor, publish the manuscript and assert the publication
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.fixture('role_names').then(name => {
      cy.login(name.role.seniorEditor, dashboard)

      DashboardPage.clickControlPanel()

      ControlPage.clickPublish()
      ControlPage.getPublishInfoMessage().should(
        'contain',
        'submission was published',
      )

      Menu.clickDashboard()

      DashboardPage.getAcceptedAndPublishedButton().should(
        'contain',
        'Accepted & Published',
      )

      cy.visit('/')

      PublicationPage.getPublicationTitle().should('eq', 'My URL submission')
    })

    // task to dump data in dumps/published_submission.sql
    cy.task('dump', 'published_submission')
  })
})
