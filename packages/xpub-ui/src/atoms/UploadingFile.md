A file that's being uploaded.

```js
const file = {
  name: faker.system.commonFileName()
};

<UploadingFile file={file}/>
```

Upload progress is displayed as an overlay.

```js
const file = {
  name: faker.system.commonFileName(),
};

<UploadingFile file={file} progress={0.5}/>
```

An upload error is displayed above the file.

```js
const file = {
  name: faker.system.commonFileName(),
};

<UploadingFile file={file} error="There was an error"/>
```
