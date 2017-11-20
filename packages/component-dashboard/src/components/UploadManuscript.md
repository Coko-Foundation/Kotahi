A button for uploading a manuscript (DOCX) file to start a submission.

```js
const conversion = {
  converting: false
};

<UploadManuscript conversion={conversion}/>
```

While the manuscript is converting, a spinner is displayed.

```js
const conversion = {
  converting: true
};

<UploadManuscript conversion={conversion}/>
```

When the manuscript is complete, the icon changes and a message can be displayed.

```js
const conversion = {
  complete: true,
  message: 'Submission created'
};

<UploadManuscript conversion={conversion}/>
```

If there is a conversion error, a error message is displayed.

```js
const conversion = {
  error: {
    message: 'There was an error'
  }
};

<UploadManuscript conversion={conversion}/>
```
