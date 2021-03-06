# requirements-editor #


## Install ##

Start up mongodb on localhost.
To support searches download and run [elastic search](http://www.elasticsearch.org/overview/elkdownloads/).

```bash
git clone https://github.com/dynamics-team/requirements-editor.git
cd ./requirements-editor
npm install
node node_modules/bower/bin/bower install
node node_modules/gulp/bin/gulp.js compile-all
node app.js
```

Visit [http://localhost:8844/](http://localhost:8844/). On android emulator use `10.0.2.2` instead of `localhost`.

[http://localhost:8844/](http://localhost:8844/) redirects to desktop application
[http://localhost:8844/app/](http://localhost:8844/app/) or to mobile application
[http://localhost:8844/mobile/](http://localhost:8844/mobile/) based on the user agent type.

For development mode use: `node node_modules/gulp/bin/gulp.js dev`

For deployment use: 
```bash
...
node app.js config_zsolt-ws.json
...
node node_modules/gulp/bin/gulp.js compile-all --config config_zsolt-ws.json`
...
```


## Build hybrid mobile application ##

Assuming all dependencies are installed for android and iOS development.

```bash
sudo npm install -g cordova ionic

node node_modules/gulp/bin/gulp.js compile-all --config config_zsolt-ws.json`

./utils/build_mobile.sh

ionic emulate ios --target="iPhone (Retina 4-inch)"
ionic emulate android
```
