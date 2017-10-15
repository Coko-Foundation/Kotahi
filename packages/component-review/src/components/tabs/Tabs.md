A set of tabs for switching between dated versions.

```js
const sections = [
  {
    key: '1485950400000',
    label: '2017-02-01',
    content: <div>foo</div>
  },
  {
    key: '1485950400001',
    label: '2017-02-14',
    content: <div>bar</div>
  },
  {
    key: '1485950400002',
    label: '2017-02-14',
    content: <div>baz</div>
  }
];

<Tabs sections={sections} activeKey={'1485950400000'}/>
```

The tabs can have a title.

```js
const sections = [
  {
    key: '2017-02-01',
    content: <div>foo</div>
  },
  {
    key: '2017-02-14',
    content: <div>bar</div>
  }
];

<Tabs sections={sections} activeKey="2017-02-14" title="Versions"/>
```
