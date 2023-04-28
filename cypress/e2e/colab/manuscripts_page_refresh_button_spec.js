/* eslint-disable jest/no-commented-out-tests */
// /* eslint-disable jest/expect-expect */
// /* eslint-disable jest/valid-expect-in-promise,jest/valid-expect */
// import {
//   manuscripts,
//   manuscriptStatus,
//   unsubmitted,
//   submitted,
//   evaluated,
//   published,
// } from '../../support/routes'
// import { ManuscriptsPage } from '../../page-object/manuscripts-page'
// import { SubmissionFormPage } from '../../page-object/submission-form-page'
// import { DashboardPage } from '../../page-object/dashboard-page'
// import { Menu } from '../../page-object/page-component/menu'
// import { ControlPage } from '../../page-object/control-page'

// describe('refresh button tests', () => {
//   context('functionality check', () => {
//     before(() => {
//       // task to restore the database as per the dumps/initial_state_other.sql
//       cy.task('restore', 'initial_state_other')
//       cy.task('seedForms')
//       // login as admin
//       cy.fixture('role_names').then(name => {
//         cy.login(name.role.admin, manuscripts)
//       })
//       cy.awaitDisappearSpinner()
//       ManuscriptsPage.getTableHead().should('be.visible')

//       // wait for data to be imported
//       // ManuscriptsPage.getSuccessfulImportPopup()
//       //   .should('exist')
//       //   .and('be.visible')
//       //   .and('contain', 'Manuscripts successfully imported')
//       cy.reload()
//       cy.awaitDisappearSpinner()
//     })

//     beforeEach(() => {
//       // login as admin
//       cy.fixture('role_names').then(name => {
//         cy.login(name.role.admin, manuscripts)
//       })
//       cy.awaitDisappearSpinner()
//       ManuscriptsPage.getTableHead().should('be.visible')
//     })

//     it('the table should contain imported articles', () => {
//       ManuscriptsPage.getNumberOfAvailableArticles()
//         .invoke('text')
//         .then(text => {
//           expect(parseInt(text, 10)).to.be.gte(1)
//         })
//     })

//     it('check imported article has data', () => {
//       const randomArticle = Math.floor(Math.random() * 10)
//       ManuscriptsPage.clickControlNthAndVerifyPageLoaded(randomArticle)

//       // eslint-disable-next-line no-plusplus
//       for (let i = 0; i < 6; i++) {
//         ControlPage.getMetadataCell(i).invoke('text').should('not.be', '')
//       }

//       ControlPage.getMetadataCell(12).invoke('text').should('not.be', '')
//     })

//     it('editDate should be populated after selecting label', () => {
//       ManuscriptsPage.clickSelect()
//       ManuscriptsPage.getArticleLabel().should('exist')
//       ManuscriptsPage.clickControlNthAndVerifyPageLoaded(0)

//       // eslint-disable-next-line no-plusplus
//       for (let i = 0; i < 6; i++) {
//         ControlPage.getMetadataCell(i).invoke('text').should('not.be', '')
//       }

//       ControlPage.getMetadataCell(12).invoke('text').should('not.be', '')
//       ControlPage.checkEditDateIsUpdated()
//     })

//     it('check only unsubmitted articles are available', () => {
//       ManuscriptsPage.getNumberOfAvailableArticles()
//         .invoke('text')
//         .then(allArticlesCount => {
//           const importedArticlesCount = parseInt(allArticlesCount, 10)
//           expect(importedArticlesCount).to.be.gt(0)
//           cy.visit(manuscriptStatus + unsubmitted)
//           cy.awaitDisappearSpinner()
//           ManuscriptsPage.getNumberOfAvailableArticles()
//             .invoke('text')
//             .then(unsubmittedCount => {
//               expect(parseInt(unsubmittedCount, 10)).to.be.eq(
//                 importedArticlesCount,
//               )
//             })
//           cy.visit(manuscriptStatus + submitted)
//           cy.awaitDisappearSpinner()
//           ManuscriptsPage.getNumberOfAvailableArticles()
//             .invoke('text')
//             .then(submittedCount => {
//               expect(parseInt(submittedCount, 10)).to.be.eq(0)
//             })
//           cy.visit(manuscriptStatus + evaluated)
//           cy.awaitDisappearSpinner()
//           ManuscriptsPage.getNumberOfAvailableArticles()
//             .invoke('text')
//             .then(evaluatedCount => {
//               expect(parseInt(evaluatedCount, 10)).to.be.eq(0)
//             })
//           cy.visit(manuscriptStatus + published)
//           cy.awaitDisappearSpinner()
//           ManuscriptsPage.getNumberOfAvailableArticles()
//             .invoke('text')
//             .then(publishedCount => {
//               expect(parseInt(publishedCount, 10)).to.be.eq(0)
//             })
//         })
//     })

// eslint-disable-next-line jest/no-commented-out-tests
//     it('editor should see article description on dashboard page', () => {
//       const randomArticle = Math.floor(Math.random() * 10)
//       ManuscriptsPage.clickControlNthAndVerifyPageLoaded(randomArticle)
//       ControlPage.getMetadataCell(0)
//         .invoke('text')
//         .then(title => {
//           cy.fixture('role_names').then(name => {
//             SubmissionFormPage.getAssignEditor(4).click()
//             SubmissionFormPage.selectDropdownOptionWithText(name.role.admin)
//             SubmissionFormPage.waitThreeSec()
//           })
//           Menu.clickDashboard()
//           cy.awaitDisappearSpinner()
//           DashboardPage.getVersionTitle().should('contain', title)
//         })
//     })
//   })
// })
