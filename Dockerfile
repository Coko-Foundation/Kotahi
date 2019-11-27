FROM node:12

ENV NODE_ENV "development"
WORKDIR /home/simplej
COPY . .

# We do a development install because react-styleguidist is a dev dependency and we want to run tests
RUN [ "yarn", "install", "--frozen-lockfile" ]


ENV NODE_ENV ${NODE_ENV}

RUN [ "npx", "pubsweet", "build"]

EXPOSE ${PORT}

CMD []

