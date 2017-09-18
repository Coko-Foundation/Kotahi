A list of supplementary files, and a button to upload a new file.

```js
const value = [
  {
    name: faker.system.commonFileName(),
    url: faker.internet.url()
  },
  {
    name: faker.system.commonFileName(),
    url: faker.internet.url()
  }
];

<Supplementary 
  value={value}
  uploadFile={file => new XMLHttpRequest()}/>
```
