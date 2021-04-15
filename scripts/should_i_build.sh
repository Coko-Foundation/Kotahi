#!/usr/bin/env bash

DOCKER_PACKAGE_VERSION=$(docker run kotahi/kotahi-elife -pe 'require("./package.json").version')

NEW_PACKAGE_VERSION=$(node -pe 'require("./package.json").version')

if [ "$NEW_PACKAGE_VERSION" == "$DOCKER_PACKAGE_VERSION" ]; then
  printf "Same version [%s]\n" "$NEW_PACKAGE_VERSION"
  exit 1
fi

printf "New version [%s] != [%s]\n" "$NEW_PACKAGE_VERSION" "$DOCKER_PACKAGE_VERSION"
exit 0