***EmptySubmission***

A message that is displayed when the current user has no submissions. Can also be used with the *UploadManuscript* component as long as an upload manuscript function is provided.

**API**

| Property  | Description | Type | Required |
|---------|----------------| --- | --- | --- |
|  text | Text to be displayed | String | True |
| conversion | Redux conversion state | Object | False |
| uploadManuscript | Upload manuscript redux action | Function | False |

```js
<EmptySubmissions
  text={`You haven't submitted any manuscripts yet.`}
  conversion={conversion}
  uploadManuscript={uploadManuscript}
  />
```
