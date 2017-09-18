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
  buttonText="Choose a file to upload"
  uploadingFile={({ file, progress, error }) => <div style={{color:'gray'}}>{file.name}</div>}
  uploadedFile={value => <div>{value.name}</div>}
  uploadFile={file => new XMLHttpRequest()}/>
```
