#!/bin/sh
if [[ -z $(git status -s) ]]
then
  echo "tree is clean"
else
  echo "tree is dirty, please commit changes before running this"
#  exit
fi

REMOTE_TARGET=`cat .publish_target`
if [[ -n "$REMOTE_TARGET" ]]
then
  echo "Publish target is ${REMOTE_TARGET}"
else
  echo "Publish target not set. Please write it in .publish_target (rsync path specifier)"
  exit
fi

BASE_DIR=`pwd`
set -x
rm -rf bin/Release
dotnet publish -c Release
dotnet restore # restore debug deps
rsync --delete -raP bin/Release/net10.0/publish/wwwroot/ ${REMOTE_TARGET}
