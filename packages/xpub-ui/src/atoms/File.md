A file.

```js
const value = {
  name: faker.system.commonFileName(),
  // type: faker.system.commonFileType(),
  // size: faker.random.number(),
};

<File value={value}/>
```

Upload progress is displayed as an overlay.

```js
const value = {
  name: faker.system.commonFileName(),
};

<File value={value} progress={0.5}/>
```

An upload error is displayed above the file.

```js
const value = {
  name: faker.system.commonFileName(),
};

<File value={value} error="There was an error"/>
```
