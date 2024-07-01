/* stylelint-disable string-quotes */

import React, { useCallback, useContext, useEffect, useState } from 'react'
import styled from 'styled-components'
import { grid, th } from '@pubsweet/ui-toolkit'
import { withRouter } from 'react-router-dom'
import { debounce } from 'lodash'
import { useTranslation } from 'react-i18next'
import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import ProductionWaxEditor from '../../../wax-collab/src/ProductionWaxEditor'
import { DownloadDropdown } from './DownloadDropdown'
import {
  Heading,
  HeadingWithAction,
  Tabs,
  Manuscript,
  ErrorBoundary,
  SectionContent,
  Spinner,
  VersionSwitcher,
} from '../../../shared'
import { Info } from './styles'
import { ControlsContainer } from '../../../component-manuscripts/src/style'
import AuthorFeedbackForm from '../../../component-author-feedback/src/components/AuthorFeedbackForm'
import UploadAsset from './uploadManager/UploadAsset'
import ReadonlyFormTemplate from '../../../component-review/src/components/metadata/ReadonlyFormTemplate'
import { color } from '../../../../theme'
import gatherManuscriptVersions from '../../../../shared/manuscript_versions'
import PreviousFeedbackSubmissions from './PreviousFeedbackSubmissions'
import { CssAssistantProvider } from '../../../component-ai-assistant/hooks/CssAssistantContext'
import AiPDFDesigner from '../../../component-ai-assistant/AiPDFDesigner'
import { ConfigContext } from '../../../config/src'
import Versioning from './Versioning'

const useVersioning = true

const PreviousFeedBackSection = styled.div`
  margin-bottom: calc(${th('gridUnit')} * 3);
`

const FlexRow = styled.div`
  display: flex;
  gap: ${grid(1)};
  justify-content: space-between;
`

const FormTemplateStyled = styled.div`
  max-height: calc(100vh - 150px);
`

const StyledManuscript = styled(Manuscript)`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  width: 100%;
`

const ScrollableTabContent = styled.section`
  background-color: ${color.backgroundA};
  border-radius: ${th('borderRadius')};
  border-top-left-radius: ${th('borderRadius')};
  box-shadow: ${({ theme }) => theme.boxShadow.shades[200]};
  height: calc(100vh - 108px);
  overflow: auto;
  width: calc(100vw - 232px);
`

const LabeledTab = styled.div`
  position: relative;

  &::before {
    background: ${color.brand1.base};
    border-radius: 5px;
    color: white;
    content: 'Beta';
    display: flex;
    font-size: 11px;
    line-height: 1;
    padding: 3px 5px;
    position: absolute;
    right: -42%;
    top: -15px;
  }
`

const Production = ({
  client,
  file,
  articleTemplate,
  displayShortIdAsIdentifier,
  form,
  manuscript,
  currentUser,
  currentUserRole,
  makePdf,
  makeJats,
  submitAuthorProofingFeedback,
  unparsedManuscript,
  updateManuscript,
  updateTemplate,
  onAssetManager,
  isAuthorProofingVersion,
  isReadOnlyVersion,
  authorList,
  addNewVersion,
}) => {
  const versions = gatherManuscriptVersions(unparsedManuscript)

  const showFeedbackTab = versions.some(
    v => v.manuscript?.authorFeedback?.previousSubmissions?.length > 0,
  )

  const saveCurrentVersion = async source => {
    // This just saves the current version of the manuscript on demand
    // Right now, this is just saving the source of the manuscript
    updateManuscript(manuscript.id, { meta: { source } })
  }

  const debouncedSave = useCallback(
    debounce(source => {
      updateManuscript(manuscript.id, { meta: { source } })
    }, 2000),
    [],
  )

  const [cssValue, setCssValue] = useState(articleTemplate.css)

  const [htmlValue, setHtmlValue] = useState(articleTemplate.article)

  const onChangeCss = useCallback(
    debounce(cssContent => {
      setCssValue(cssContent)
      updateTemplate(articleTemplate.id, {
        css: cssContent,
      })
    }, 2000),
    [],
  )

  const onChangeHtml = useCallback(
    debounce(article => {
      setHtmlValue(article)
      updateTemplate(articleTemplate.id, { article })
    }, 2000),
    [],
  )

  useEffect(() => {
    debouncedSave.flush()
    onChangeCss.flush()
    onChangeHtml.flush()
  }, [])

  const { t } = useTranslation()

  const config = useContext(ConfigContext)

  const editorSection = {
    content: (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {(file &&
          file.storedObjects[0].mimetype ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
        ['lab'].includes(config?.instanceName) ? (
          <SectionContent>
            {manuscript ? (
              <ProductionWaxEditor
                // onBlur={source => {
                //   updateManuscript(manuscript.id, { meta: { source } })
                // }}
                client={client}
                isAuthorProofingVersion={isAuthorProofingVersion}
                manuscriptId={manuscript.id}
                onAssetManager={onAssetManager}
                readonly={isReadOnlyVersion || false}
                saveSource={debouncedSave}
                user={currentUser}
                value={manuscript.meta.source}
              />
            ) : (
              <Spinner />
            )}
          </SectionContent>
        ) : (
          <SectionContent>
            <Info>{t('productionPage.No supported view of the file')}</Info>
          </SectionContent>
        )}
      </>
    ),
    key: 'editor',
    label: `${t('productionPage.Editor')} ${
      isReadOnlyVersion ? t('productionPage.read-only') : ''
    }`,
  }

  const feedbackSection = {
    content: (
      <>
        {isAuthorProofingVersion &&
          ['assigned', 'inProgress'].includes(manuscript.status) && (
            <SectionContent>
              <AuthorFeedbackForm
                currentUser={currentUser}
                manuscript={manuscript}
                submitAuthorProofingFeedback={submitAuthorProofingFeedback}
              />
            </SectionContent>
          )}
        <PreviousFeedBackSection>
          <VersionSwitcher fullWidth>
            {versions.map((version, i) => (
              <PreviousFeedbackSubmissions
                key={version.manuscript.id}
                version={version.manuscript}
              />
            ))}
          </VersionSwitcher>
        </PreviousFeedBackSection>
      </>
    ),
    key: 'feedback',
    label: t('productionPage.Feedback'),
  }

  const cssPagedJS = {
    content: (
      <ScrollableTabContent>
        <CodeMirror
          extensions={[css()]}
          onChange={onChangeCss}
          value={cssValue}
        />
      </ScrollableTabContent>
    ),
    key: 'cssPagedJs',
    label: t('productionPage.PDF CSS'),
  }

  const htmlTemplate = {
    content: (
      <ScrollableTabContent>
        <CodeMirror
          extensions={[html()]}
          onChange={onChangeHtml}
          value={htmlValue}
        />
      </ScrollableTabContent>
    ),
    key: 'html-template',
    label: t('productionPage.PDF template'),
  }

  const uploadAssets = {
    content: (
      <ScrollableTabContent>
        <UploadAsset
          files={articleTemplate.files}
          groupTemplateId={articleTemplate.groupId}
          tag="isPdf"
        />
      </ScrollableTabContent>
    ),
    key: 'template-assets',
    label: t('productionPage.PDF assets'),
  }

  const manuscriptMetadata = {
    content: (
      <ScrollableTabContent>
        <FormTemplateStyled>
          <ReadonlyFormTemplate
            copyHandleBarsCode
            displayShortIdAsIdentifier={displayShortIdAsIdentifier}
            form={form}
            formData={manuscript}
            manuscript={manuscript}
            // threadedDiscussionProps={threadedDiscussionExtendedProps}
            showEditorOnlyFields
          />
        </FormTemplateStyled>
      </ScrollableTabContent>
    ),
    key: 'manuscript-metadata',
    label: t('productionPage.PDF metadata'),
  }

  const cssAiAssistant = {
    content: (
      <CssAssistantProvider>
        <AiPDFDesigner currentUser={currentUser} manuscript={manuscript} />
      </CssAssistantProvider>
    ),
    hideOnly: true,
    key: 'css-ai-assistant',
    label: <LabeledTab>Ai Design Studio</LabeledTab>,
  }

  const tabSections = []

  const versioningSection = {
    key: 'versioning',
    label: 'History',
    content: (
      <Versioning
        addNewVersion={addNewVersion} // this is basically the same
        authorList={authorList}
        currentUser={currentUser}
        manuscript={manuscript}
        saveCurrentVersion={saveCurrentVersion}
      />
    ),
  }

  tabSections.push(editorSection)

  // Only author in author proofing mode can have editor seciton and feedback section visible
  if (isAuthorProofingVersion) {
    tabSections.push(feedbackSection)
  } else {
    // The manuscript editor can only view editor section and feedback section in readonly mode
    /* eslint-disable no-lonely-if */
    if (isReadOnlyVersion && showFeedbackTab) {
      tabSections.push(feedbackSection)
    } else {
      if (useVersioning) tabSections.push(versioningSection)

      tabSections.push(
        htmlTemplate,
        cssPagedJS,
        uploadAssets,
        manuscriptMetadata,
        cssAiAssistant,
      )
    }
  }

  return (
    <StyledManuscript>
      <HeadingWithAction>
        <FlexRow>
          <Heading>
            {isAuthorProofingVersion
              ? t('productionPage.AuthorProofing')
              : t('productionPage.Production')}
          </Heading>
          <ControlsContainer>
            <DownloadDropdown
              isAuthorProofingVersion={isAuthorProofingVersion}
              makeJats={makeJats}
              makePdf={makePdf}
              manuscriptId={manuscript.id}
              manuscriptSource={manuscript.meta.source}
            />
          </ControlsContainer>
        </FlexRow>
      </HeadingWithAction>
      <ErrorBoundary>
        <Tabs defaultActiveKey="editor" sections={tabSections} />
      </ErrorBoundary>
    </StyledManuscript>
  )
}

export default withRouter(Production)
