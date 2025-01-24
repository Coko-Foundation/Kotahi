FROM cokoapps/base:18

WORKDIR /home/node/app

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile

WORKDIR /home/node/app/packages/server
COPY packages/server/package.json .
COPY packages/server/yarn.lock .

WORKDIR /home/node/app/packages/client
COPY packages/client/package.json .
COPY packages/client/yarn.lock .

WORKDIR /home/node/app/packages/devdocs
COPY packages/devdocs/package.json .
COPY packages/devdocs/yarn.lock .

WORKDIR /home/node/app/packages/server
RUN yarn install --frozen-lockfile

WORKDIR /home/node/app/packages/client
RUN yarn install --frozen-lockfile

WORKDIR /home/node/app/packages/devdocs
RUN yarn install --frozen-lockfile

WORKDIR /home/node/app

RUN yarn cypress cache clear
RUN yarn cache clean

COPY . .

# USER node
