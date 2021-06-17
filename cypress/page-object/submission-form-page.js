/// <reference types="Cypress" />
import { ManuscriptsPage } from './manuscripts-page'
import { evaluate, submit } from '../support/routes'

/**
 * Page object representing the form which has
 * to be completed to correctly submit a research paper.
 * It contains various input fields & dropdowns,
 * listed in the same order they appear on the page.
 */
const PAGE_TITLE = '[class*=style__Heading]'
const ADD_A_LINK_BUTTON = 'li > button'
const ENTER_URL_FIELD = 'submission.links.'
const TITLE_FIELD = 'meta.title'
const NAME_FIELD = 'submission.name'
const AFFILIATION_FIELD = 'submission.affiliation'
const CONTACT_FIELD = 'submission.contact'
// const COVER_FIELD = 'submission.cover'
// const DATA_CODE_FIELD = 'submission.datacode'
// const ETHICS_FIELD = 'submission.ethics'
const TYPE_OF_RESEARCH_DROPDOWN = 'Type of Research Object'
const DROPDOWN_OPTION_LIST = '[class*=MenuList] > [id*=option]'
const SUGGESTED_FIELD = 'submission.suggested'
const FILE_DROPZONE = 'dropzone'
const KEYWORDS_FIELD = 'submission.keywords'
const HEALTHY_SUBJECTS_STUDY_DROPDOWN = 'healthy subjects only or patients'
const INVOLVED_HUMAN_SUBJECTS_DROPDOWN = 'involved human subjects'
const ANIMAL_RESEARCH_APPROVED_DROPDOWN = 'animal research approved'
const METHODS_USED_CHECKBOX = 'submission.methods'
const OTHER_METHODS_FIELD = 'submission.otherMethods'
const FILED_STRENGTH_DROPDOWN = 'what field strength'
const HUMAN_MRI_OTHER_FIELD = 'submission.humanMRIother'
const PROCESSING_PACKAGES_CHECKBOX_LIST = 'submission.packages'
const OTHER_PACKAGES_FIELD = 'submission.otherPackages'
// const REFERENCES_FIELD = 'submission.references'
const SUBMIT_RESEARCH_BUTTON = 'form > div > button'
const SUBMIT_MANUSCRIPT_BUTTON = 'button[type=submit]'
const VALIDATION_ERROR_MESSAGE = 'ValidatedField__MessageWrapper'
const CONTENT_EDITABLE_VALUE = '[contenteditable="true"]'
const SUBMISSION_FORM_INPUT_BOX = 'SimpleWaxEditor__EditorDiv'

// specific to elife
const FORM_OPTION_LIST = '[class*=style__Section]'
const FORM_OPTION_VALUE = 'singleValue'
const ARTICLE_ID_FIELD = 'submission.articleId'
const ARTICLE_URL_FIELD = 'submission.articleURL'
const DESCRIPTION_FIELD = 'submission.description'
const BIORXIV_ARTICLE_URL_FIELD = 'submission.biorxivURL'
const REVIEW_1_DATE_FEILD = 'submission.review1date'
const REVIEW_2_DATE_FEILD = 'submission.review2date'
const REVIEW_3_DATE_FEILD = 'submission.review3date'
const SUMMARY_DATE = 'submission.summarydate'
const REVIEW_1_CREATOR_FIELD = 'submission.review1creator'
const REVIEW_2_CREATOR_FIELD = 'submission.review2creator'
const REVIEW_3_CREATOR_FIELD = 'submission.review3creator'
const SUMMARY_CREATOR_FIELD = 'submission.summarycreator'

// specific to ncrc
const ARTICLE_DESCRIPTION_FIELD = 'submission.articleDescription'
const FIRST_AUTHOR_FIELD = 'submission.firstAuthor'
const DATE_PUBLISHED_FIELD = 'submission.datePublished'
const JOURNAL_FIELD = 'submission.journal'
const REVIEWER_FIELD = 'submission.reviewer'
const EDIT_DATE_FIELD = 'submission.editDate'
const REVIEW_CREATOR_FIELD = 'submission.reviewCreator'
const DROPDOWN = 'placeholder'
const TOPICS_CHECKBOX_LIST = 'submission.topics'
const ASSIGN_EDITORS_DROPDOWN = '[class*=General__SectionRow] > [class]'

export const SubmissionFormPage = {
  getPageTitle() {
    return cy.get(PAGE_TITLE)
  },
  getAddLinkButton() {
    return cy.get(ADD_A_LINK_BUTTON)
  },
  clickAddLink() {
    this.getAddLinkButton().click()
  },
  getEnterUrlField(nth) {
    return cy.getByContainsName(ENTER_URL_FIELD).eq(nth)
  },
  fillInUrl(nth, url) {
    this.getEnterUrlField(nth).fillInput(url)
  },
  getTitleField() {
    return cy.getByDataTestId(TITLE_FIELD)
  },
  fillInTitle(title) {
    this.getTitleField().fillInput(title)
  },
  getNameField() {
    return cy.getByDataTestId(NAME_FIELD)
  },
  fillInName(name) {
    this.getNameField().fillInput(name)
  },
  getAffiliationField() {
    return cy.getByDataTestId(AFFILIATION_FIELD)
  },
  fillInAffiliation(affiliation) {
    this.getAffiliationField().fillInput(affiliation)
  },
  getContactField() {
    return cy.getByDataTestId(CONTACT_FIELD)
  },
  fillInContact(contact) {
    this.getContactField().fillInput(contact)
  },
  // getCoverField() {
  //   return cy.getByContainsClass(COVER_FIELD)
  // },
  getAllWaxInputBoxes() {
    return cy.getByContainsClass(SUBMISSION_FORM_INPUT_BOX)
  },
  getWaxInputBox(nth) {
    return this.getAllWaxInputBoxes().eq(nth)
  },
  fillInCover(cover) {
    this.getWaxInputBox(0).find(CONTENT_EDITABLE_VALUE).fillInput(cover)
  },
  // getDataCodeField() {
  //   return cy.getByDataTestId(DATA_CODE_FIELD)
  // },
  fillInDataCode(dataCode) {
    this.getWaxInputBox(1).find(CONTENT_EDITABLE_VALUE).fillInput(dataCode)
  },
  // getEthicsField() {
  //   return cy.getByDataTestId(ETHICS_FIELD)
  // },
  fillInEthicsField(ethics) {
    this.getWaxInputBox(2).find(CONTENT_EDITABLE_VALUE).fillInput(ethics)
  },
  getTypeOfResearchDropdown() {
    return cy.getByContainsAreaLabel(TYPE_OF_RESEARCH_DROPDOWN)
  },
  clickTypeOfResearchDropdown() {
    this.getTypeOfResearchDropdown().click({ force: true })
  },
  selectDropdownOption(nth) {
    return cy.get(DROPDOWN_OPTION_LIST).eq(nth).click()
  },
  getSuggestedField() {
    return cy.getByDataTestId(SUGGESTED_FIELD)
  },
  fillInSuggested(suggested) {
    this.getSuggestedField().fillInput(suggested)
  },
  getFileDropzone() {
    return cy.getByDataTestId(FILE_DROPZONE)
  },
  attachFile(file) {
    this.getFileDropzone().attachFile(
      file,
      // {
      //   fileContent,
      //   fileName: 'test-pdf.pdf',
      //   encoding: 'base64',
      //   mimeType: 'application/pdf',
      // },
      { subjectType: 'drag-n-drop' },
    )
  },
  getKeywordsField() {
    return cy.getByDataTestId(KEYWORDS_FIELD)
  },
  fillInKeywords(keywords) {
    this.getKeywordsField().fillInput(keywords)
  },
  getHealthySubjectsStudyDropdown() {
    return cy.getByContainsAreaLabel(HEALTHY_SUBJECTS_STUDY_DROPDOWN)
  },
  clickHealthySubjectsStudyDropdown() {
    this.getHealthySubjectsStudyDropdown().click({ force: true })
  },
  getInvolvedHumanSubjectsDropdown() {
    return cy.getByContainsAreaLabel(INVOLVED_HUMAN_SUBJECTS_DROPDOWN)
  },
  clickInvolvedHumanSubjectsDropdown() {
    this.getInvolvedHumanSubjectsDropdown().click({ force: true })
  },
  getAnimalResearchApprovedDropdown() {
    return cy.getByContainsAreaLabel(ANIMAL_RESEARCH_APPROVED_DROPDOWN)
  },
  clickAnimalResearchApprovedDropdown() {
    this.getAnimalResearchApprovedDropdown().click({ force: true })
  },
  getMethodsUsedCheckboxWithText(value) {
    return cy.getByNameAndValue(METHODS_USED_CHECKBOX, value)
  },
  clickMethodsUsedCheckboxWithText(value) {
    this.getMethodsUsedCheckboxWithText(value).click()
  },
  getOtherMethodsField() {
    return cy.getByDataTestId(OTHER_METHODS_FIELD)
  },
  fillInOtherMethods(text) {
    this.getOtherMethodsField().fillInput(text)
  },
  getFieldSthrenghtDropdown() {
    return cy.getByContainsAreaLabel(FILED_STRENGTH_DROPDOWN)
  },
  clickFieldSthrenghtDropdown() {
    this.getFieldSthrenghtDropdown().click({ force: true })
  },
  getHumanMriOtherField() {
    return cy.getByDataTestId(HUMAN_MRI_OTHER_FIELD)
  },
  fillInHumanMriOther(other) {
    this.getHumanMriOtherField().fillInput(other)
  },
  getProcessingPackagesCheckboxWithText(text) {
    return cy.getByNameAndValue(PROCESSING_PACKAGES_CHECKBOX_LIST, text)
  },
  clickProcessingPackageWithText(text) {
    this.getProcessingPackagesCheckboxWithText(text).click()
  },
  getOtherPackagesField() {
    return cy.getByDataTestId(OTHER_PACKAGES_FIELD)
  },
  fillInOtherPackages(otherPackages) {
    this.getOtherPackagesField().fillInput(otherPackages)
  },
  // getReferencesField() {
  //   return cy.getByDataTestId(REFERENCES_FIELD)
  // },
  fillReferences(references) {
    this.getWaxInputBox(3).find(CONTENT_EDITABLE_VALUE).fillInput(references)
  },
  getSubmitResearchButton() {
    return cy.get(SUBMIT_RESEARCH_BUTTON)
  },
  clickSubmitResearch() {
    this.getSubmitResearchButton().click()
  },
  clickSubmitResearchAndWaitPageLoad() {
    this.clickSubmitResearch()
    cy.url().should('not.contain', submit).and('not.contain', evaluate)
    cy.awaitDisappearSpinner()
    ManuscriptsPage.getTableHeader().should('be.visible')
  },
  getSubmitManuscriptButton() {
    return cy.get(SUBMIT_MANUSCRIPT_BUTTON)
  },
  clickSubmitManuscript() {
    this.getSubmitManuscriptButton().click()
  },
  clickSubmitManuscriptAndWaitPageLoad() {
    this.clickSubmitManuscript()
    cy.url().should('not.contain', submit)
    cy.awaitDisappearSpinner()
    ManuscriptsPage.getTableHeader().should('be.visible')
  },
  getValidationErrorMessage(error) {
    return cy.getByContainsClass(VALIDATION_ERROR_MESSAGE).contains(error)
  },
  getValidationErrorMessage2() {
    return cy.getByContainsClass(VALIDATION_ERROR_MESSAGE)
  },
  getFormOptionValue(nth) {
    return cy.getByContainsClass(FORM_OPTION_VALUE).eq(nth)
  },
  getFormOptionList(nth) {
    return cy.get(FORM_OPTION_LIST).eq(nth)
  },
  clickElementFromFormOptionList(nth) {
    cy.get(FORM_OPTION_LIST).eq(nth).click()
  },
  getDropdownOption(nth) {
    return cy.get(DROPDOWN_OPTION_LIST).eq(nth)
  },
  getArticleld() {
    return cy.getByDataTestId(ARTICLE_ID_FIELD)
  },
  fillInArticleld(articleId) {
    this.getArticleld().fillInput(articleId)
  },
  getArticleUrl() {
    return cy.getByDataTestId(ARTICLE_URL_FIELD)
  },
  fillInArticleUrl(articleUrl) {
    this.getArticleUrl().fillInput(articleUrl)
  },
  getBioRxivArticleUrl() {
    return cy.getByDataTestId(BIORXIV_ARTICLE_URL_FIELD)
  },
  fillInBioRxivArticleUrl(bioRxivArticleUrl) {
    this.getBioRxivArticleUrl().fillInput(bioRxivArticleUrl)
  },
  getDescription() {
    return cy.getByDataTestId(DESCRIPTION_FIELD)
  },
  fillInDescription(description) {
    this.getDescription().fillInput(description)
  },
  getReview1Date() {
    return cy.getByDataTestId(REVIEW_1_DATE_FEILD)
  },
  fillInReview1Date(review1Date) {
    this.getReview1Date().fillInput(review1Date)
  },
  getReview1() {
    // return cy.get(EVALUATION_CONTENT_FIELD)
    return this.getWaxInputBox(0)
  },
  fillInReview1(review1) {
    this.getReview1().find(CONTENT_EDITABLE_VALUE).fillInput(review1)
  },
  getReview1Creator() {
    return cy.getByDataTestId(REVIEW_1_CREATOR_FIELD)
  },
  fillInReview1Creator(review1Creator) {
    this.getReview1Creator().fillInput(review1Creator)
  },
  getReview2() {
    return this.getWaxInputBox(1)
  },
  fillInReview2(review2) {
    this.getReview2().find(CONTENT_EDITABLE_VALUE).fillInput(review2)
  },
  getReview2Creator() {
    return cy.getByDataTestId(REVIEW_2_CREATOR_FIELD)
  },
  fillInReview2Creator(review2Creator) {
    this.getReview2Creator().fillInput(review2Creator)
  },
  getReview2Date() {
    return cy.getByDataTestId(REVIEW_2_DATE_FEILD)
  },
  fillInReview2Date(review2Date) {
    this.getReview2Date().fillInput(review2Date)
  },
  getReview3() {
    return this.getWaxInputBox(2)
  },
  fillInReview3(review3) {
    this.getReview3().find(CONTENT_EDITABLE_VALUE).fillInput(review3)
  },
  getReview3Creator() {
    return cy.getByDataTestId(REVIEW_3_CREATOR_FIELD)
  },
  fillInReview3Creator(review3Creator) {
    this.getReview3Creator().fillInput(review3Creator)
  },
  getReview3Date() {
    return cy.getByDataTestId(REVIEW_3_DATE_FEILD)
  },
  fillInReview3Date(review3Date) {
    this.getReview3Date().fillInput(review3Date)
  },
  getSummary() {
    return this.getWaxInputBox(3)
  },
  fillInSummary(summary) {
    this.getSummary().find(CONTENT_EDITABLE_VALUE).fillInput(summary)
  },
  getSummaryCreator() {
    return cy.getByDataTestId(SUMMARY_CREATOR_FIELD)
  },
  fillInSummaryCreator(summaryCreator) {
    this.getSummaryCreator().fillInput(summaryCreator)
  },

  getSummaryDate() {
    return cy.getByDataTestId(SUMMARY_DATE)
  },
  fillInSummaryDate(summaryDate) {
    this.getSummaryDate().fillInput(summaryDate)
  },

  getArticleDescriptionField() {
    return cy.getByName(ARTICLE_DESCRIPTION_FIELD)
  },
  fillInArticleDescription(description) {
    this.getArticleDescriptionField().fillInput(description)
  },
  getOurTakeField() {
    return this.getWaxInputBox(0)
  },
  fillInOurTake(ourTake) {
    this.getOurTakeField().find(CONTENT_EDITABLE_VALUE).fillInput(ourTake)
  },
  getOurTakeContent() {
    return this.getOurTakeField().find('p').invoke('text')
  },
  getStudySettingField() {
    return this.getWaxInputBox(1)
  },
  fillInStudySetting(studySetting) {
    this.getStudySettingField()
      .find(CONTENT_EDITABLE_VALUE)
      .fillInput(studySetting)
  },
  getStudySettingContent() {
    return this.getStudySettingField().find('p')
  },
  getMainFindingsField() {
    return this.getWaxInputBox(1)
  },
  fillInMainFindings(mainFindings) {
    this.getMainFindingsField()
      .find(CONTENT_EDITABLE_VALUE)
      .fillInput(mainFindings)
  },
  getMainFindingsContent() {
    return this.getMainFindingsField().find('p')
  },
  getStudyStrengthsField() {
    return this.getWaxInputBox(2)
  },
  fillInStudyStrengths(studyStrengths) {
    this.getStudyStrengthsField()
      .find(CONTENT_EDITABLE_VALUE)
      .fillInput(studyStrengths)
  },
  getStudyStrengthsContent() {
    return this.getStudyStrengthsField().find('p')
  },
  getLimitationsField() {
    return this.getWaxInputBox(3)
  },
  fillInLimitations(limitations) {
    this.getLimitationsField()
      .find(CONTENT_EDITABLE_VALUE)
      .fillInput(limitations)
  },
  getLimitationsContent() {
    return this.getLimitationsField().find('p')
  },
  getValueAddedField() {
    return this.getWaxInputBox(4)
  },
  fillInValueAdded(valueAdded) {
    this.getValueAddedField().find(CONTENT_EDITABLE_VALUE).fillInput(valueAdded)
  },
  getValueAddedContent() {
    return this.getValueAddedField().find('p')
  },
  getDropdown(nth) {
    return cy.getByContainsClass(DROPDOWN).eq(nth)
  },
  clickDropdown(nth) {
    this.getDropdown(nth).click({ force: true })
  },
  getTopicsCheckboxWithText(value) {
    return cy.getByNameAndValue(TOPICS_CHECKBOX_LIST, value)
  },
  getCheckedTopics() {
    return cy.get(`[name="${TOPICS_CHECKBOX_LIST}"][checked]`)
  },
  getCheckedTopicsCount() {
    return cy.get(`[name="${TOPICS_CHECKBOX_LIST}"][checked]`).its('length')
  },
  clickTopicsCheckboxWithText(value) {
    this.getTopicsCheckboxWithText(value).click()
  },
  waitThreeSec() {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000)
  },
  getAssignEditor(nth) {
    return cy.get(ASSIGN_EDITORS_DROPDOWN).eq(nth)
  },
  getFirstAuthorField() {
    return cy.getByDataTestId(FIRST_AUTHOR_FIELD)
  },
  fillInFirstAuthor(firstAuthor) {
    this.getFirstAuthorField().fillInput(firstAuthor)
  },
  getDatePublishedField() {
    return cy.getByDataTestId(DATE_PUBLISHED_FIELD)
  },
  fillInDatePublished(datePublished) {
    this.getDatePublishedField().fillInput(datePublished)
  },
  getJournalField() {
    return cy.getByDataTestId(JOURNAL_FIELD)
  },
  fillInJournal(journal) {
    this.getJournalField().fillInput(journal)
  },
  getReviewerField() {
    return cy.getByDataTestId(REVIEWER_FIELD)
  },
  fillInReviewer(reviewer) {
    this.getReviewerField().fillInput(reviewer)
  },
  getEditDateField() {
    return cy.getByDataTestId(EDIT_DATE_FIELD)
  },
  fillInEditDate(editDate) {
    this.getEditDateField().fillInput(editDate)
  },
  getReviewCreatorField() {
    return cy.getByDataTestId(REVIEW_CREATOR_FIELD)
  },
  fillInReviewCreator(reviewCreator) {
    this.getReviewCreatorField().fillInput(reviewCreator)
  },
  getAbstractField() {
    return this.getWaxInputBox(5)
  },
  fillInAbstract(abstract) {
    this.getAbstractField().fillInput(abstract)
  },
  getAbstractContent() {
    return this.getAbstractField().find('p').invoke('text')
  },
}
export default SubmissionFormPage
