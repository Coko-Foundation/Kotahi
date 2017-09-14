A set of tabs for switching between dated versions.

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

<Tabs sections={sections} activeKey="2017-02-14"/>
```
