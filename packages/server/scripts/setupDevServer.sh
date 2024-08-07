#!/bin/sh
set -x

# This is run through docker. Its CWD will be the root folder.
node_modules/.bin/coko-server migrate

exec "$@"
