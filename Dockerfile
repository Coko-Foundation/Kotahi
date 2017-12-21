FROM node:8.9-alpine
MAINTAINER PubSweet Team <richard@coko.foundation>

ENV HOME "/home/xpub"

RUN mkdir -p ${HOME}

# git required for yarn. Why isn't it included!?
# the rest is for compiling leveldown
RUN apk add --no-cache --virtual .gyp \
        python \
        curl \
        make \
        g++ \
        git

RUN git config --global user.email "test@testing.com" && \
    git config --global user.name "Fakey McFakerson"

WORKDIR ${HOME}

COPY package.json yarn.lock lerna.json .eslintignore .eslintrc .prettierrc .stylelintignore .stylelintrc ./
COPY packages packages

RUN [ "yarn", "config", "set", "workspaces-experimental", "true" ]
# We do a development install because react-styleguidist is a dev dependency
RUN [ "yarn", "install", "--frozen-lockfile" ]

RUN [ "npm", "rebuild", "bcrypt", "--build-from-source=bcrypt"]

ENV NODE_ENV "production"

# We are temporarily going to use the same image with different commands to deploy different apps in the monorepo. This is bad :(.

WORKDIR ${HOME}/packages/xpub-collabra
# TODO pass in username and password as build arguments
RUN [ "npx", "pubsweet", "build"]

## No xpub-ui to deploy yet
# WORKDIR ${HOME}/packages/xpub-ui
# RUN [ "npm", "run", "styleguide:build" ]
## Create file for kubernetes health checks
# RUN touch ./styleguide/health

EXPOSE 3000

WORKDIR ${HOME}
CMD []
