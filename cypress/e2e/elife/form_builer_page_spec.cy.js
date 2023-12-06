/* eslint-disable jest/expect-expect */
import { FormsPage } from '../../page-object/forms-page'
import { submissionForm } from '../../support/routes2'

describe('Form builder', () => {
  context('check Form builder elements visibility', () => {
    beforeEach(() => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.task('restore', 'commons/elife_bootstrap')

      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, submissionForm)
      })
      FormsPage.verifyPageLoaded()
    })

    it('check elements from form builder', () => {
      cy.fixture('form_option').then(data => {
        const formElements = [
          data.preprint1.articleId,
          data.preprint1.articleUrl,
          data.preprint1.bioRxivArticleUrl,
          data.preprint1.description,
          data.preprint1.review1,
          data.preprint1.review1Creator,
          data.preprint1.review1Date,
          data.preprint1.review2,
          data.preprint1.review2Creator,
          data.preprint1.review2Date,
          data.preprint1.review3,
          data.preprint1.review3Creator,
          data.preprint1.review3Date,
          data.preprint1.summary,
          data.preprint1.summaryCreator,
          data.preprint1.summaryDate,
        ]

        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 16; i++) {
          FormsPage.getFormBuilderElementName(i).should(
            'contain',
            formElements[i],
          )
        }
      })
    })

    // check the type of the field and if is required
    it('check form fields type and if are required', () => {
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.task('restore', 'commons/elife_bootstrap')
      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, submissionForm)
      })
      FormsPage.verifyPageLoaded()
      const requiredField = 'Required'

      const typeField = [
        'Text',
        'Text',
        'Text',
        'Text',
        'Rich text',
        'Text',
        'Text',
        'Rich text',
        'Text',
        'Text',
        'Rich text',
        'Text',
        'Text',
        'Rich text',
        'Text',
        'Text',
      ]

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < 16; i++) {
        FormsPage.clickFormOption(i)
        FormsPage.getComponentType().should('contain', typeField[i])
      }

      // eslint-disable-next-line no-plusplus
      for (let j = 0; j < 4; j++) {
        FormsPage.clickFormOption(j)
        FormsPage.getFieldValidate().should('contain', requiredField)
      }

      // eslint-disable-next-line no-plusplus
      for (let k = 5; k < 16; k++) {
        FormsPage.clickFormOption(k)
        FormsPage.getFieldValidate().should('not.contain', requiredField)
      }
    })

    it('check DOI validation has default selected Yes and select No', () => {
      FormsPage.clickFormOption(1)
      FormsPage.getDoiValidation(0).should('have.prop', 'checked')
      FormsPage.clickOptionsDoiVaildation(1)
      FormsPage.getDoiValidation(1).should('have.prop', 'checked')
    })
  })

  context('add field to submission, review and decision forms', () => {
    it('views a form field', () => {
      // task to restore the database as per the  dumps/commons/elife_bootstrap.sql
      cy.task('restore', 'commons/elife_bootstrap')

      // login as admin
      // eslint-disable-next-line jest/valid-expect-in-promise
      cy.fixture('role_names').then(name => {
        cy.login(name.role.admin, submissionForm)
      })
      // For Submission field
      FormsPage.getFormTitleTab(0).should('contain', 'eLife Submission Form')
      FormsPage.clickFormOption(1)
      FormsPage.getFieldValidate()
      cy.get(':nth-child(8) > .style__Legend-sc-1npdrat-1')
      cy.get(
        ':nth-child(8) > :nth-child(2) > .css-3x5r4n-container > .react-select__control > .react-select__value-container',
      ).click()
      cy.get('.react-select__option').eq(0).click()
      cy.contains('Update Field').click()
      // adding a field in submission form
      cy.contains('Add Field').click({ force: true })
      cy.contains('Choose in the list').click()
      cy.get('button')
      cy.contains('Single image attachment').click()
      cy.contains('Name (internal field name)').click()
      cy.get('[name=name]').type('submission.visualAbstract')
      cy.contains('Update Field').click()

      // for review field
      cy.contains('Review').click()
      FormsPage.getFormTitleTab(0).should('contain', 'Review')
      FormsPage.clickFormOption(1)
      FormsPage.getNameField().should('have.value', 'files').clear()
      cy.get('[name=name]').type('files')
      cy.contains('Update Field').click()

      // adding a field in review form
      cy.contains('Add Field').click({ force: true })
      cy.contains('Choose in the list').click()
      cy.get('button')
      cy.contains('Single image attachment').click()
      cy.contains('Name (internal field name)').click()
      cy.get('[name=name]').type('visualAbstract')
      cy.contains('Update Field').click()

      // for decision field
      cy.contains('Decision').click()
      FormsPage.getFormTitleTab(0).should('contain', 'Decision')
      FormsPage.clickFormOption(1)
      FormsPage.getNameField().should('have.value', 'files').clear()
      cy.get('[name=name]').type('files')
      cy.contains('Update Field').click()

      // adding a field in decision form
      cy.contains('Add Field').click({ force: true })
      cy.contains('Choose in the list').click()
      cy.get('button')
      cy.contains('Single image attachment').click()
      cy.contains('Name (internal field name)').click()
      cy.get('[name=name]').type('visualAbstract')
      cy.contains('Update Field').click()
    })
  })
})
