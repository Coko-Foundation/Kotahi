A file attached to a note.

```js
const value = {
    name: faker.system.commonFileName(),
    url: faker.internet.url()
};

<Attachment value={value}/>
```
