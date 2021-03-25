import { FormsPage } from '../../page-object/forms-page'
import { NewSubmissionPage } from '../../page-object/new-submission-page'
import { Menu } from '../../page-object/page-component/menu'
import { SubmissionFormPage } from '../../page-object/submission-form-page'
import { ManuscriptsPage } from '../../page-object/manuscripts-page'

describe('Form builder page tests', () => {

    //check the title and the elements in Form Builder
    context('check Form builer elements visibility', () => {

        beforeEach(() => {
            // task to restore the database as per the  dumps/initialState.sql
            cy.task('restore', 'initialState')
            // login as admin
            cy.fixture('role_names').then(name => {
                cy.login(name.role.admin) // Senior editor
            })

            // enter the from page and assert the fileds
            Menu.clickForms()
        })

        it('check title and elements from form buider', () => {
            cy.fixture('form_option').then(data => {
                FormsPage.getFormTitleTab(0).should('contain', data.title)
                FormsPage.getFormBuilderElementName(0).should('contain', data.field1)
                FormsPage.getFormBuilderElementName(1).should('contain', data.field2)
                FormsPage.getFormBuilderElementName(2).should('contain', data.field3)
                FormsPage.getFormBuilderElementName(3).should('contain', data.field4)
                FormsPage.getFormBuilderElementName(4).should('contain', data.field5)
                FormsPage.getFormBuilderElementName(5).should('contain', data.field6)
            })
        })

        //check the type of the field and if is required
        it('first element check to have options TextField and Required selected', () => {
            FormsPage.clickFormOption(0);
            FormsPage.getComponentType().should('contain', 'TextField')
            FormsPage.getFieldValidate().should('contain', 'Required')
            FormsPage.clickFormOption(1);
            FormsPage.getComponentType().should('contain', 'TextField')
            FormsPage.getFieldValidate().should('contain', 'Required')
            FormsPage.clickFormOption(2);
            FormsPage.getComponentType().should('contain', 'TextField')
            FormsPage.getFieldValidate().should('contain', 'Required')
            FormsPage.clickFormOption(3);
            FormsPage.getComponentType().should('contain', 'AbstractEditor')
            FormsPage.getFieldValidate().should('contain', 'Required')
            FormsPage.clickFormOption(4);
            FormsPage.getComponentType().should('contain', 'Select')
            FormsPage.getFieldValidate().should('contain', 'Required')
            FormsPage.clickFormOption(5);
            FormsPage.getComponentType().should('contain', 'TextField')
            FormsPage.getFieldValidate().should('not.contain', 'Required')
        })
    })

    context('check the Submission form based on form builder', () => {

        beforeEach(() => {
            // task to restore the database as per the  dumps/initialState.sql
            cy.task('restore', 'initialState')
            // login as admin
            cy.fixture('role_names').then(name => {
                cy.login(name.role.admin) // Senior editor
            })

            // enter the from page and assert the fileds
            Menu.clickManuscripts()
            ManuscriptsPage.clickSubmit()
            NewSubmissionPage.clickSubmitURL()
        })

        //check if the form contain all the colums
        it('check if the form contain all the colums', () => {
            cy.fixture('form_option').then(data => {
                SubmissionFormPage.getFormOptionList(0).should('contain', data.field1)
                SubmissionFormPage.getFormOptionList(1).should('contain', data.field2)
                SubmissionFormPage.getFormOptionList(2).should('contain', data.field3)
                SubmissionFormPage.getFormOptionList(3).should('contain', data.field4)
                SubmissionFormPage.getFormOptionList(4).should('contain', data.field5)
                SubmissionFormPage.getFormOptionList(5).should('contain', data.field6)
            })
        })

        //check if it is displayed the required message
        it('check required message', () => {
            SubmissionFormPage.clickSubmitResearch()
            cy.fixture('form_option').then(data => {
                SubmissionFormPage.getFormOptionList(0).should('contain', data.fieldOption)
                SubmissionFormPage.getFormOptionList(1).should('contain', data.fieldOption)
                SubmissionFormPage.getFormOptionList(2).should('contain', data.fieldOption)
                SubmissionFormPage.getFormOptionList(3).should('contain', data.fieldOption)
                SubmissionFormPage.getFormOptionList(4).should('contain', data.fieldOption)
            })
        })

        //check if the options: Evaluation Summary, Peer Review and Author Response are avaible in Evaluation Type field
        it('check Evaluation Type filed options', () => {
            cy.fixture('form_option').then(data => {
                SubmissionFormPage.clickElementFromFormOptionList(4)
                SubmissionFormPage.getDropdownOption(0).should('contain', data.evaluationTypeOption1)
                SubmissionFormPage.getDropdownOption(1).should('contain', data.evaluationTypeOption2)
                SubmissionFormPage.getDropdownOption(2).should('contain', data.evaluationTypeOption3)
            })
        })

    })
})
