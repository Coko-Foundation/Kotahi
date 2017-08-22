An editor for a manuscript.

```js
const project = {
  
};

const version = {
  progress: {},
  source: '<div><h1>This is an example</h1></div>'
};

const currentUser = {
  teams: [
    {
      teamType: {
        name: 'Production Editor'
      }
    }
  ]
};

<Manuscript 
  project={project}
  version={version}
  currentUser={currentUser}
  fileUpload={data => console.log(data)}
  updateVersion={(project, version) => console.log(project, version)}/>
```
