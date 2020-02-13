import React from 'react'
import { forEach } from 'lodash'
import styled from 'styled-components'
import { Tabs, Action } from '@pubsweet/ui'
import { Columns, Admin } from './atoms/Columns'
import ComponentProperties from './ComponentProperties'
import FormBuilder from './FormBuilder'
import FormProperties from './FormProperties'

const DeleteIcon = styled(Action)`
  margin-left: 10px;
  line-height: 1.15;
`

const AdminStyled = styled(Admin)`
  border-left: 1px solid black;
  padding-left: 40px;
`

const FormBuilderLayout = ({
  getForms,
  properties,
  deleteForm,
  deleteElement,
  updateForm,
  createForm,
  updateElements,
  changeProperties,
  changeTabs,
  activeTab,
}) => {
  const Sections = []
  forEach(getForms, (form, key) => {
    Sections.push({
      content: (
        <FormBuilder
          changeProperties={changeProperties}
          deleteElement={deleteElement}
          form={form}
          key={`form-builder-${key}`}
        />
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
      <FormProperties
        key="form-builder-new"
        mode="create"
        onSubmitFn={createForm}
        properties={{}}
      />
    ),
    key: 'new',
    label: '+ Add Form',
  })
  return (
    <Columns>
      <Tabs
        activeKey={`${activeTab}`}
        onChange={tab => {
          changeProperties({
            type: 'form',
            properties: getForms[tab],
          })
          changeTabs(tab)
        }}
        sections={Sections}
        title="builder"
      />
      <AdminStyled>
        <ComponentProperties
          changeTabs={changeTabs}
          key={`${properties.type}-${(properties.properties || {}).id}`}
          onSubmitFn={properties.type === 'form' ? updateForm : updateElements}
          properties={properties}
        />
      </AdminStyled>
    </Columns>
  )
}

export default FormBuilderLayout
