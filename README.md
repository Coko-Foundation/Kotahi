# xpub-collabra
Xpub-collabra is a manuscript submission system for the [Collabra Psychology](https://www.collabra.org/) journal.  
It is currently under development by the [Coko Foundation](https://coko.foundation/) and is being built with the tools provided by the [Pubsweet](https://gitlab.coko.foundation/pubsweet/pubsweet) and [INK](https://gitlab.coko.foundation/INK) projects.  

## Roadmap

This is the current set of features and their status on our roadmap.

|Module             |Description                                    |In progress    |Done       |Issue
|:---               |---                                            |:---:          |:---:      |:---:
|**Current**|
|Component      |New Simple Form Builder  |&#x2714;      |   |#234
|System      | Fixing issue on assigning reviewer  |&#x2714;      |   |#235
|**Previous**|
|System      |New Data modeling migration  |      |&#x2714;    |#233
|System      |Mock graphql Server |       |&#x2714;   |#231
|System      |GraphQL implementation of xpub FrontEnd Components  |        |&#x2714;  |#232


### PubSweet components
The application consists primarily of the following high-level pubsweet components, which roughly correspond to the pages in the system:

* `xpub-app`: a PubSweet component that provides an app container with nav bar and journal provider.
* `xpub-dashboard`: a PubSweet component that provides a Dashboard page.
* `xpub-submit`: a PubSweet component that provides a Submit page.
* `xpub-manuscript`: a PubSweet component that provides a Manuscript page.
* `xpub-review`: a PubSweet component that provides a Review page.

The code for these components (as well as the smaller UI elements that they are made of) can be found in the [pubsweet repo](https://gitlab.coko.foundation/pubsweet/pubsweet/tree/master/packages).


## Installation

### Quickstart

To quickly get up and running, run

```
yarn start
```

This will run the various docker containers that the app needs. If you're doing development, you'll probably want to follow the next set of instructions.

**Note**:  
`yarn` will be run automatically inside the container to install dependencies. If dependencies were already installed on the host, this may cause problems as the binaries are compiled for the wrong platform. If you encounter errors about "invalid ELF header", run `yarn clean && yarn start`.

### Running the app manually

Start with installing the dependencies:
```
yarn
```

Create the file `local-development.json` inside the `config` folder.

```json
{
    "pubsweet-server": {
        "secret": "<your-secret-here>"
    },
    "pubsweet-component-ink-backend": {
        "inkEndpoint": "< your-ink-api-endpoint >",
        "email": "< your-ink-email >",
        "password": "< your-ink-password >",
        "recipes": {
            "editoria-typescript": "< editoria-typescript-recipe-id >"
        }
    }
}
```

This will give your database a secret, as well as enable manuscript docx to HTML conversion via the INK service. (ask in our [chat channel](https://mattermost.coko.foundation/coko/channels/xpub) if you don't know how to set up an INK account)

Run the docker container for the database.

```
yarn start:services
```

Now (in a separate terminal) run the app.
```
yarn server
```

## Continuous Integration

CI requires a Kubernetes cluster, resources for which can be found in [`pubsweet/infra`](https://gitlab.coko.foundation/pubsweet/infra).  
In order to set up a Kubernetes cluster using AWS, you need to follow the instructions there.  

Templates for deploying to this cluster with [`pubsweet/deployer`](https://gitlab.coko.foundation/pubsweet/deployer) are located in [`xpub/deployment-config`](https://gitlab.coko.foundation/xpub/deployment-config).

## Community

Join [the Mattermost channel](https://mattermost.coko.foundation/coko/channels/xpub) for discussion of xpub.
