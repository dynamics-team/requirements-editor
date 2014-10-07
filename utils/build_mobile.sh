#!/bin/bash

rm -rf www platforms plugins

ln -s src/build www
mkdir plugins

ionic platform add ios
ionic build ios

ionic platform add android
ionic build android
