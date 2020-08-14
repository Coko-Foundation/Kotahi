FROM cypress/browsers:node12.18.0-chrome83-ff77

ENV HOME "/home/simplej"
RUN mkdir -p ${HOME}
WORKDIR ${HOME}

ENV NODE_ENV "development"

# Only copy things needed for the yarn install
COPY package.json yarn.lock .

# We do a development install because react-styleguidist is a dev dependency and we want to run tests
RUN [ "yarn", "install", "--frozen-lockfile" ]

ENV NODE_ENV ${NODE_ENV}

# Disabling the build for now, as it runs in the test server again
# RUN [ "npx", "pubsweet", "build"]

# The copy everything else that changes frequently
COPY . .
EXPOSE ${PORT}

CMD []

