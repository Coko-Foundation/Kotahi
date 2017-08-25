A list of uploaded files, a list of uploading files and a button to upload more files.

```js
const file = () => ({
  name: faker.system.commonFileName(),
  type: faker.system.commonFileType(),
  size: faker.random.number(),
});

const value = [
  file(),
  file(),
  file()
];

<Files
  value={value}
  uploadFile={file => new XMLHttpRequest()}/>
```
