# requirements-editor #


## Install ##

Start up mongodb on localhost.

```bash
git clone https://github.com/dynamics-team/requirements-editor.git ./requirements-editor
cd ./requirements-editor
npm install
node node_modules/bower/bin/bower install
node node_modules/gulp/bin/gulp.js compile-all
node app.js
```

Visit http://localhost:8844/

For development mode use: node node_modules/gulp/bin/gulp.js dev

## Build for mobile ##

```bash
npm install -g cordova ionic
ln -s src/build www
cordova plugin add org.apache.cordova.device
cordova plugin add org.apache.cordova.console
cordova plugin add com.ionic.keyboard
ionic platform add ios
ionic build ios
ionic emulate ios
```


