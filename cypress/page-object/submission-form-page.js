/// <reference types="Cypress" />
import { ManuscriptsPage } from './manuscripts-page'

/**
 * Page object representing the form which has
 * to be completed to correctly submit a research paper.
 * It contains various input fields & dropdowns,
 * listed in the same order they appear on the page.
 */
const ADD_A_LINK_BUTTON = 'li > button'
const ENTER_URL_FIELD = 'submission.links.'
const TITLE_FIELD = 'meta.title'
const NAME_FIELD = 'submission.name'
const AFFILIATION_FIELD = 'submission.affiliation'
const CONTACT_FIELD = 'submission.contact'
const COVER_FIELD = 'submission.cover'
const DATA_CODE_FIELD = 'submission.datacode'
const ETHICS_FIELD = 'submission.ethics'
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
const REFERENCES_FIELD = 'submission.references'
const SUBMIT_RESEARCH_BUTTON = 'form > div > button'
const SUBMIT_MANUSCRIPT_BUTTON = 'button[type=submit]'
const VALIDATION_ERROR_MESSAGE = 'ValidatedField__MessageWrapper'
const CONTENT_EDITABLE_VALUE = '[contenteditable="true"]'

// specific to elife
const FORM_OPTION_LIST = '[class*=style__Section]'
const FORM_OPTION_VALUE = 'singleValue'
const ARTICLE_ID_FIELD = 'submission.articleId'
const ARTICLE_URL_FIELD = 'submission.articleURL'
const DESCRIPTION_FIELD = 'submission.description'
const EVALUATION_CONTENT_FIELD = 'submission.evaluationContent'
const CREATOR_FIELD = 'submission.creator'

// specific to ncrc
const ARTICLE_DESCRIPTION_FIELD = 'submission.articleDescription'
const OUR_TAKE_FIELD = 'submission.ourTake'
const DROPDOWN = 'placeholder'
const STUDY_SETTING_FIELD = 'submission.studyPopulationAndSetting'
const MAIN_FINDINGS_FIELD = 'submission.summaryOfMainFindings'
const STUDY_STRENGTHS_FIELD = 'submission.studyStrengths'
const LIMITATIONS_FIELD = 'submission.limitations'
const VALUE_ADDED_FIELD = 'submission.valueAdded'
const TOPICS_CHECKBOX_LIST = 'submission.topics'

export const SubmissionFormPage = {
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
  getCoverField() {
    return cy.getByDataTestId(COVER_FIELD)
  },
  fillInCover(cover) {
    this.getCoverField().find(CONTENT_EDITABLE_VALUE).fillInput(cover)
  },
  getDataCodeField() {
    return cy.getByDataTestId(DATA_CODE_FIELD)
  },
  fillInDataCode(dataCode) {
    this.getDataCodeField().find(CONTENT_EDITABLE_VALUE).fillInput(dataCode)
  },
  getEthicsField() {
    return cy.getByDataTestId(ETHICS_FIELD)
  },
  fillInEthicsField(ethics) {
    this.getEthicsField().find(CONTENT_EDITABLE_VALUE).fillInput(ethics)
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
  getReferencesField() {
    return cy.getByDataTestId(REFERENCES_FIELD)
  },
  fillReferences(references) {
    this.getReferencesField().find(CONTENT_EDITABLE_VALUE).fillInput(references)
  },
  getSubmitResearchButton() {
    return cy.get(SUBMIT_RESEARCH_BUTTON)
  },
  clickSubmitResearch() {
    this.getSubmitResearchButton().click()
  },
  clickSubmitResearchAndWaitPageLoad() {
    this.clickSubmitResearch()
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
    ManuscriptsPage.getTableHeader().should('be.visible')
  },
  getValidationErrorMessage(error) {
    return cy.getByContainsClass(VALIDATION_ERROR_MESSAGE).contains(error)
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
  getDescription() {
    return cy.getByDataTestId(DESCRIPTION_FIELD)
  },
  fillInDescription(description) {
    this.getDescription().fillInput(description)
  },
  getEvaluationContent() {
    return cy.getByDataTestId(EVALUATION_CONTENT_FIELD)
  },
  fillInEvaluationContent(evaluationContent) {
    this.getEvaluationContent()
      .find(CONTENT_EDITABLE_VALUE)
      .fillInput(evaluationContent)
  },
  getCreatorField() {
    return cy.getByDataTestId(CREATOR_FIELD)
  },
  fillInCreator(creator) {
    this.getCreatorField().fillInput(creator)
  },
  getArticleDescriptionField() {
    return cy.getByName(ARTICLE_DESCRIPTION_FIELD)
  },
  fillInArticleDescription(description) {
    this.getArticleDescriptionField().fillInput(description)
  },
  getOurTakeField() {
    return cy.getByName(OUR_TAKE_FIELD)
  },
  fillInOurTake(ourTake) {
    this.getOurTakeField().fillInput(ourTake)
  },
  getOurTakeContent() {
    return this.getOurTakeField().find('p')
  },
  getStudySettingField() {
    return cy.getByName(STUDY_SETTING_FIELD)
  },
  fillInStudySetting(studySetting) {
    this.getStudySettingField().fillInput(studySetting)
  },
  getStudySettingContent() {
    return this.getStudySettingField().find('p')
  },
  getMainFindingsField() {
    return cy.getByName(MAIN_FINDINGS_FIELD)
  },
  fillInMainFindings(mainFindings) {
    this.getMainFindingsField().fillInput(mainFindings)
  },
  getMainFindingsContent() {
    return this.getMainFindingsField().find('p')
  },
  getStudyStrengthsField() {
    return cy.getByName(STUDY_STRENGTHS_FIELD)
  },
  fillInStudyStrengths(studyStrengths) {
    this.getStudyStrengthsField().fillInput(studyStrengths)
  },
  getStudyStrengthsContent() {
    return this.getStudyStrengthsField().find('p')
  },
  getLimitationsField() {
    return cy.getByName(LIMITATIONS_FIELD)
  },
  fillInLimitations(limitations) {
    this.getLimitationsField().fillInput(limitations)
  },
  getLimitationsContent() {
    return this.getLimitationsField().find('p')
  },
  getValueAddedField() {
    return cy.getByName(VALUE_ADDED_FIELD)
  },
  fillInValueAdded(valueAdded) {
    this.getValueAddedField().fillInput(valueAdded)
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
  clickTopicsCheckboxWithText(value) {
    this.getTopicsCheckboxWithText(value).click()
  },
  waitThreeSec() {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000)
  },
}
export default SubmissionFormPage
