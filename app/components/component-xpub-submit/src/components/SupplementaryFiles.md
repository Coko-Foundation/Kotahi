A form for entering the submission's supplementary material.

```js
const file = () => ({
  file: {
    url: faker.internet.url(),
    name: faker.system.commonFileName(),
  },
  filename: faker.system.commonFileName(),
  type: 'supplementary',
})

const manuscript = {
  files: [file(), file(), file()],
}
;<SupplementaryFiles
  manuscript={manuscript}
  onChange={values => console.log(values)}
/>
```
