FROM node:12

ENV NODE_ENV "development"

# We do a development install because react-styleguidist is a dev dependency and we want to run tests
RUN [ "yarn", "install", "--frozen-lockfile" ]

# Remove cache and offline mirror
RUN [ "yarn", "cache", "clean"]
RUN [ "rm", "-rf", "/npm-packages-offline-cache"]

COPY app.js .babelrc .eslintignore .eslintrc .prettierrc .stylelintignore .stylelintrc ./

COPY app app
COPY config config
COPY scripts scripts
COPY static static
COPY test test
COPY server server
COPY webpack webpack

ENV NODE_ENV ${NODE_ENV}

RUN [ "npx", "pubsweet", "build"]

EXPOSE ${PORT}

CMD []

