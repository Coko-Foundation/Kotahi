import React from 'react'
import { forEach } from 'lodash'
import styled from 'styled-components'
import { Tabs, Action } from '@pubsweet/ui'
import { Columns, Details, Form } from './style'
import ComponentProperties from './ComponentProperties'
import FormBuilder from './FormBuilder'
import FormProperties from './FormProperties'
import {
  Container,
  HeadingWithAction,
  Heading,
  SectionContent,
  SectionRow,
} from '../../../shared'

const DeleteIcon = styled(Action)`
  margin-left: 10px;
  line-height: 1.15;
`

const FormBuilderLayout = ({
  getForms,
  properties,
  deleteForm,
  deleteFormElement,
  updateForm,
  createForm,
  updateFormElement,
  setProperties,
  setActiveTab,
  activeTab,
}) => {
  const Sections = []
  forEach(getForms, (form, key) => {
    Sections.push({
      content: (
        <SectionContent>
          <SectionRow>
            <FormBuilder
              deleteFormElement={deleteFormElement}
              form={form}
              key={`form-builder-${key}`}
              setProperties={setProperties}
            />
          </SectionRow>
        </SectionContent>
      ),
      key: `${key}`,
      label: [
        form.name,
        <DeleteIcon
          key={`delete-form-${key}`}
          onClick={e => {
            e.preventDefault()
            deleteForm(form.id)
          }}
        >
          x
        </DeleteIcon>,
      ],
    })
  })

  Sections.push({
    content: (
      <SectionContent>
        <SectionRow>
          <FormProperties
            key="form-builder-new"
            mode="create"
            onSubmitFn={createForm}
            properties={{}}
          />
        </SectionRow>
      </SectionContent>
    ),
    key: 'new',
    label: '+ Add Form',
  })
  return (
    <Container>
      <HeadingWithAction>
        <Heading>Form Builder</Heading>
      </HeadingWithAction>
      <Columns>
        <Form>
          <Tabs
            activeKey={`${activeTab}`}
            onChange={tab => {
              setProperties({
                type: 'form',
                properties: getForms[tab],
              })
              setActiveTab(tab)
            }}
            sections={Sections}
          />
        </Form>
        <Details>
          <SectionContent>
            <SectionRow>
              <ComponentProperties
                key={`${properties.type}-${(properties.properties || {}).id}`}
                properties={properties}
                setActiveTab={setActiveTab}
                updateForm={updateForm}
                updateFormElement={updateFormElement}
              />
            </SectionRow>
          </SectionContent>
        </Details>
      </Columns>
    </Container>
  )
}

export default FormBuilderLayout
