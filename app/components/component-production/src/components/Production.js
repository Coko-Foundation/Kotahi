import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { grid } from '@pubsweet/ui-toolkit'
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
  HiddenTabs,
  Manuscript,
  ErrorBoundary,
  SectionContent,
  Spinner,
} from '../../../shared'
import { Info } from './styles'
import { ControlsContainer } from '../../../component-manuscripts/src/style'
import UploadAsset from './UploadAsset'
// import ReadonlyFormTemplate from './ReadonlyFormTemplate'
import ReadonlyFormTemplate from '../../../component-review/src/components/metadata/ReadonlyFormTemplate'

const FlexRow = styled.div`
  display: flex;
  gap: ${grid(1)};
  justify-content: space-between;
`

const FormTemplateStyled = styled.div`
  max-height: calc(100vh - 150px);
`

const Production = ({
  client,
  file,
  articleTemplate,
  displayShortIdAsIdentifier,
  form,
  manuscript,
  currentUser,
  makePdf,
  makeJats,
  updateManuscript,
  updateTemplate,
  onAssetManager,
}) => {
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

  useEffect(
    () => () => {
      debouncedSave.flush()
      onChangeCss.flush()
      onChangeHtml.flush()
    },
    [],
  )

  const { t } = useTranslation()

  const editorSection = {
    content: (
      <>
        {file &&
        file.storedObjects[0].mimetype ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? (
          <SectionContent>
            {manuscript ? (
              <ProductionWaxEditor
                // onBlur={source => {
                //   updateManuscript(manuscript.id, { meta: { source } })
                // }}
                client={client}
                manuscriptId={manuscript.id}
                onAssetManager={onAssetManager}
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
    label: `Editor`,
  }

  const cssPagedJS = {
    content: (
      <SectionContent>
        <CodeMirror
          extensions={[css()]}
          height="850px"
          onChange={onChangeCss}
          value={cssValue}
        />
      </SectionContent>
    ),
    key: 'cssPagedJs',
    label: 'PagedJs Css',
  }

  const htmlTemplate = {
    content: (
      <SectionContent>
        <CodeMirror
          extensions={[html()]}
          height="850px"
          onChange={onChangeHtml}
          value={htmlValue}
        />
      </SectionContent>
    ),
    key: 'html-template',
    label: 'PagedJs Html Template',
  }

  const uploadAssets = {
    content: (
      <SectionContent>
        <UploadAsset
          files={articleTemplate.files}
          groupTemplateId={articleTemplate.id}
        />
      </SectionContent>
    ),
    key: 'template-assets',
    label: 'PagedJs Template Assets',
  }

  const manuscriptMetadata = {
    content: (
      <SectionContent>
        <FormTemplateStyled>
          <ReadonlyFormTemplate
            copyHandleBarsCode
            displayShortIdAsIdentifier={displayShortIdAsIdentifier}
            form={form}
            formData={{
              ...manuscript,
              submission: JSON.parse(manuscript.submission),
            }}
            manuscript={manuscript}
            // threadedDiscussionProps={threadedDiscussionExtendedProps}
            showEditorOnlyFields
          />
        </FormTemplateStyled>
      </SectionContent>
    ),
    key: 'manuscript-metadata',
    label: 'PagedJs Metadata',
  }

  return (
    <Manuscript>
      <HeadingWithAction>
        <FlexRow>
          <Heading>{t('productionPage.Production')}</Heading>
          <ControlsContainer>
            <DownloadDropdown
              makeJats={makeJats}
              makePdf={makePdf}
              manuscriptId={manuscript.id}
              manuscriptSource={manuscript.meta.source}
            />
          </ControlsContainer>
        </FlexRow>
      </HeadingWithAction>
      <ErrorBoundary>
        <HiddenTabs
          defaultActiveKey="editor"
          sections={[
            editorSection,
            cssPagedJS,
            htmlTemplate,
            uploadAssets,
            manuscriptMetadata,
          ]}
        />
      </ErrorBoundary>
    </Manuscript>
  )
}

export default withRouter(Production)
