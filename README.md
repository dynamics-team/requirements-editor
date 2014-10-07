# requirements-editor #


## Install ##

Start up mongodb on localhost.

```bash
git clone https://github.com/dynamics-team/requirements-editor.git
cd ./requirements-editor
npm install
node node_modules/bower/bin/bower install
node node_modules/gulp/bin/gulp.js compile-all
node app.js
```

Visit [http://localhost:8844/](http://localhost:8844/). On android emulator use `10.0.2.2` instead of `localhost`.

For development mode use: `node node_modules/gulp/bin/gulp.js dev`

### Add a new requirement ###

Make sure the file conforms to the expected format.

`curl -d @sandbox/jklingler/Examples/Radio/TopLevelRequirementGroup.json  -H "Content-Type: application/json" http://127.0.0.1:8844/requirement/`


## Build for mobile ##

Assuming all dependencies are installed for android and iOS development.

```bash
sudo npm install -g cordova ionic

./utils/build_mobile.sh


ionic emulate ios
ionic emulate android
```
