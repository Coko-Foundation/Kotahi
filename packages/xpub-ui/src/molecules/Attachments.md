A list of files attached to a note, and a button to attach a new file.

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

<Attachments 
  value={value}
  uploadFile={file => new XMLHttpRequest()}/>
```
