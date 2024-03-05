#!/bin/sh
set -x

cd ./packages/server
# node node_modules/pubsweet-server/src/start
node ./startServer.js
