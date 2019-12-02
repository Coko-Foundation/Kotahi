FROM node:12

ENV HOME "/home/simplej"
RUN mkdir -p ${HOME}
WORKDIR ${HOME}

ENV NODE_ENV "development"

# Install dependencies for Cypress
RUN apt-get -y update && apt-get -y install xvfb libgtk-3-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2

COPY . .

# We do a development install because react-styleguidist is a dev dependency and we want to run tests
RUN [ "yarn", "install", "--frozen-lockfile" ]

ENV NODE_ENV ${NODE_ENV}

RUN [ "npx", "pubsweet", "build"]

EXPOSE ${PORT}

CMD []

