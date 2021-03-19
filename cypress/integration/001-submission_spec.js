import { DashboardPage } from "../page-object/dashboard-page"
import { NewSubmissionPage } from "../page-object/new-submission-page"
import { SubmissionFormPage } from "../page-object/submission-form-page"
import { Menu } from "../page-object/page-component/menu"
import { ManuscriptsPage } from "../page-object/manuscripts-page"
import { ControlPage } from "../page-object/control-page"

describe('URL submission test', () => {
  it('can submit a URL and some metadata', () => {
    // task to restore the database as per the  dumps/initialState.sql
    cy.task('restore', 'initialState');

    // login as author
    cy.fixture("role_names").then(name => {
      cy.login(name.role.author);
    });

    // submit new manuscript
    DashboardPage.clickSubmit();

    NewSubmissionPage.clickSubmitURL();
    NewSubmissionPage.getSubmissionMessage().should('contain', 'Submission created');

    // complete the submission form 
    SubmissionFormPage.clickAddLink();

    cy.fixture("submission_form_data").then(data => {
      SubmissionFormPage.fillInUrl(0, data.doi);
      SubmissionFormPage.fillInUrl(0, data.git);
      SubmissionFormPage.fillInTitle(data.title);

      cy.fixture("role_names").then(name => {
        SubmissionFormPage.fillInName(name.role.author);
      });

      SubmissionFormPage.fillInAffiliation(data.affiliation);
      SubmissionFormPage.fillInContact(data.contact);
      SubmissionFormPage.fillInCover(data.cover);
      SubmissionFormPage.fillInDataCode(data.dataCode);
      SubmissionFormPage.fillInEthicsField(data.ethics);
      SubmissionFormPage.clickTypeOfResearchDropdown()
      SubmissionFormPage.selectDropdownOption(1)
      SubmissionFormPage.fillInSuggested(data.suggested);

      // Supplementary file upload
      cy.fixture("test-pdf.pdf", 'base64').then(pdf => {
        SubmissionFormPage.attachFile("test-pdf.pdf");
      });

      SubmissionFormPage.fillInKeywords(data.keywords);
      SubmissionFormPage.clickHealthySubjectsStudyDropdown()
      SubmissionFormPage.selectDropdownOption(1)
      SubmissionFormPage.clickInvolvedHumanSubjectsDropdown()
      SubmissionFormPage.selectDropdownOption(0)
      SubmissionFormPage.clickAnimalResearchApprovedDropdown()
      SubmissionFormPage.selectDropdownOption(0);
      SubmissionFormPage.clickMethodsUsedCheckboxWithText(`"${data.methods.firstMethod}"`);
      SubmissionFormPage.clickMethodsUsedCheckboxWithText(`"${data.methods.secondMethod}"`);
      SubmissionFormPage.fillInOtherMethods(data.suggested);
      SubmissionFormPage.clickFieldSthrenghtDropdown();
      SubmissionFormPage.selectDropdownOption(3);
      SubmissionFormPage.fillInHumanMriOther(data.humanMRIother);
      SubmissionFormPage.clickProcessingPackageWithText(data.processinPackages.text1);
      SubmissionFormPage.clickProcessingPackageWithText(data.processinPackages.text2);
      SubmissionFormPage.fillInOtherPackages(data.otherPackages);
      SubmissionFormPage.fillReferences(data.references);
      // submit form
      SubmissionFormPage.clickSubmitResearch();
      SubmissionFormPage.clickSubmitManuscript();

      // assert form exists in dashboard
      DashboardPage.getSectionTitleWithText('My Submissions');
      DashboardPage.getSubmissionTitle(0).should("contain", data.title);
    });

    // task to dump data in dumps/submission_complete.sql
    cy.task('dump', 'submission_complete');
  });

  it('senior editor can view the submission', () => {
    // task to restore the database as per the  dumps/submission_complete.sql
    cy.task('restore', 'submission_complete');

    cy.fixture("submission_form_data").then(data => {
      cy.fixture("role_names").then(name => {
        // login as admin
        cy.login(name.role.admin);

        // select Control on the Manuscripts page
        Menu.clickManuscripts();

        ManuscriptsPage.selectOptionWithText("Control");

        ControlPage.getMetadataCell(3).should('contain', data.title);
        // assign seniorEditor
        ControlPage.clickAssignEditorDropdown();
        ControlPage.selectEditorByName(name.role.seniorEditor);

        // login as seniorEditor
        cy.login(name.role.seniorEditor);
      });

      // assert Manuscript exist
      DashboardPage.getVersionTitle().should("contain", data.title);
      // click ControPanel and assert manuscript
      DashboardPage.clickControlPanel();

      ControlPage.getMetadataCell(8).should('contain', data.dataCode);
      ControlPage.getMetadataCell(25).should('contain', data.pdf);
      ControlPage.getMetadataCell(0).should('contain', data.doi);
      ControlPage.getMetadataCell(0).should('contain', data.git);
    });

    // task to dump data in dumps/senior_editor_assigned.sql
    cy.task('dump', 'senior_editor_assigned');
  });
});
