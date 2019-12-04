A form builder to create forms

```js
const forms = [
  {
    name: 'test form',
    id: 'test',
    children: [
      {
        title: 'Title',
        id: '1531303631370',
        component: 'AbstractEditor',
        name: 'metadata.title',
        placeholder: 'Enter Title...',
        validate: ['required'],
        validateValue: { minChars: '10' },
      },
      {
        title: 'Title 1',
        id: '1531303631371',
        component: 'AbstractEditor',
        name: 'metadata.title',
        placeholder: 'Enter Title...',
        validate: ['required'],
        validateValue: { minChars: '10' },
      },
    ],
  },
  { name: 'test form 1', id: 'test1' },
]

initialState = {
  properties: {
    type: 'form',
    properties: forms[0],
  },
  activeTab: 0,
}
;<div style={{ position: 'relative', height: '100%' }}>
  <FormBuilderLayout
    getForms={forms}
    activeTab={state.activeTab}
    properties={state.properties}
    changeProperties={value => {
      setState({ properties: value })
    }}
    changeTabs={value => setState({ activeTab: value })}
  />
</div>
```
