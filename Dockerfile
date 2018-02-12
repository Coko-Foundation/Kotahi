FROM xpub/xpub:base

COPY package.json yarn.lock ./
COPY lerna.json .babelrc .eslintignore .eslintrc .prettierrc .stylelintignore .stylelintrc ./
COPY packages packages

RUN [ "yarn", "config", "set", "workspaces-experimental", "true" ]

# We do a development install because react-styleguidist is a dev dependency
RUN [ "yarn", "install", "--frozen-lockfile" ]

# Remove cache and offline mirror
RUN [ "yarn", "cache", "clean"]
RUN [ "rm", "-rf", "/npm-packages-offline-cache"]

ENV NODE_ENV "production"

# We are temporarily going to use the same image with different commands to deploy different apps in the monorepo. This is bad :(.

WORKDIR ${HOME}/packages/xpub-collabra
RUN [ "npx", "pubsweet", "build"]

## No xpub-ui to deploy yet
# WORKDIR ${HOME}/packages/xpub-ui
# RUN [ "npm", "run", "styleguide:build" ]
## Create file for kubernetes health checks
# RUN touch ./styleguide/health

EXPOSE 3000

WORKDIR ${HOME}
CMD []
