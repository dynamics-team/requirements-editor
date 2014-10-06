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

