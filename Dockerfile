FROM xpub/xpub:base

WORKDIR ${HOME}

# install Chrome
RUN curl -sL http://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo 'deb http://dl.google.com/linux/chrome/deb/ stable main' >> /etc/apt/sources.list.d/google.list
RUN apt-get update && apt-get install -y google-chrome-stable

# install Firefox - apparently no debian package for firefox 57
RUN apt-get install -y libdbus-glib-1-2
RUN cd /opt && wget http://ftp.mozilla.org/pub/firefox/releases/57.0.4/linux-x86_64/en-GB/firefox-57.0.4.tar.bz2 && \
    tar xjf firefox-*.tar.bz2 && \
    ln -s /opt/firefox/firefox /usr/local/bin/

COPY package.json yarn.lock ./

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
COPY webpack webpack

ENV NODE_ENV "production"

RUN [ "npx", "pubsweet", "build"]

EXPOSE ${PORT:-3000}

CMD []

