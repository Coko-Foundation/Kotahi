# SimpleJ
SimpleJ is a manuscript submission system, based on the discontinued [xpub-collabra](https://gitlab.coko.foundation/xpub/xpub) project.
It is currently under development by the [Coko Foundation](https://coko.foundation/) and is being built with [Pubsweet](https://gitlab.coko.foundation/pubsweet/pubsweet).

## Installation

Developer beware! This project is currently under heavy development, so things will most definitely be broken. We also don't have a fixed roadmap for it at this point.

### Running the app

Start with installing the dependencies:
```
yarn
```

Create the file `local-development.json` inside the `config` folder.

```json
{
    "pubsweet-server": {
        "secret": "<your-secret-here>"
    }
}
```

Run the Docker container for the database and the XSweet (Docx to HTML conversion) job runner.

```
yarn start:services
```

Now (in a separate terminal) run the server (backend PubSweet app).
```
yarn pubsweet start:server
```

And in another terminal run the client (webpack-based PubSweet app):
```
yarn pubsweet start:client
```