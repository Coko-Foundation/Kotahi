FROM cypress/browsers:node12.18.0-chrome83-ff77

ENV HOME "/home/simplej"
RUN mkdir -p ${HOME}
WORKDIR ${HOME}

ENV NODE_ENV "development"

COPY . .

# We do a development install because react-styleguidist is a dev dependency and we want to run tests
RUN [ "yarn", "install", "--frozen-lockfile" ]

ENV NODE_ENV ${NODE_ENV}

RUN [ "npx", "pubsweet", "build"]

EXPOSE ${PORT}

CMD []

