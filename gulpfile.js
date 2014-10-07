/*globals require, console, process*/
'use strict';

var argv = require('yargs').argv,
    livereloadport = 35729,
    serverport = 5000,

    debug = !argv.production,
    debugShim = false, //this is for toggling browserify shim debug

    libraryName = 'requirements-editor',
    libraryTemplatesModule = 'requirements.editor.templates',

    sourcePaths = {

        index: './src/client/app/index.html',
        testIndex: './src/client/app/test.html',
        libraryModuleScript: './src/client/app/app.js',
        libraryScripts: [
            'src/client/app/**/*.js'
        ],
        libraryTemplates: [
            'src/client/app/views/*.html'
        ],
        libraryStyles: [
            'src/client/app/styles/*.scss'
        ],
        libraryImages: [
            'src/client/**/*.png',
            'src/client/**/*.jpg',
            'src/client/**/*.svg'
        ]
    },

    buildPaths = {

        root: 'src/build',

        scripts: 'src/build/app',
        templates: 'src/build/app/templates',
        styles: 'src/build/app/styles',
        images: 'src/build/app/images'
    },

    sourcePathsMobile = {

        index: './src/client/mobile/index.html',

        libraryModuleScript: './src/client/mobile/app.js',
        libraryScripts: [
            'src/client/mobile/**/*.js'
        ],
        libraryTemplates: [
            'src/client/mobile/templates/*.html'
        ],
        libraryStyles: [
            'src/client/mobile/styles/*.scss'
        ],
        libraryImages: [
            'src/client/**/*.png',
            'src/client/**/*.jpg',
            'src/client/**/*.svg'
        ]
    },

    buildPathsMobile = {

        root: 'src/build',

        scripts: 'src/build/mobile',
        templates: 'src/build/mobile/templates',
        styles: 'src/build/mobile/styles',
        images: 'src/build/mobile/images'
    },

    gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    browserify = require('browserify'),
    concat = require('gulp-concat'),
    source = require('vinyl-source-stream'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    runSequence = require('run-sequence'),
    clean = require('gulp-clean'),
    templateCache = require('gulp-angular-templatecache'),

    express = require('express'),
    server = express(),
    livereload = require('connect-livereload'),
    refresh = require('gulp-livereload'),
    lrserver = require('tiny-lr')(),
    prettify = require('gulp-js-prettify');

// Utility tasks

require('process');
require('path');

gulp.task('clean-build', function () {
    return gulp.src(buildPaths.root).pipe(clean());
});

// Library tasks

gulp.task('lint-library', function () {

    console.log('Linting library...');

    gulp.src(sourcePaths.libraryScripts)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));

    gulp.src(sourcePathsMobile.libraryScripts)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));

});

gulp.task('browserify-library', function () {

    console.log('Browserifying library...');

    if (debugShim) {
        process.env.BROWSERIFYSHIM_DIAGNOSTICS = 1;
    }

    return browserify({
        entries: [sourcePaths.libraryModuleScript],
        debug: debug
    })
        .bundle()
        .pipe(source(libraryName + '.js'))
        .pipe(gulp.dest(buildPaths.scripts));

});

gulp.task('browserify-library-mobile', function () {

    console.log('Browserifying library mobile...');

    if (debugShim) {
        process.env.BROWSERIFYSHIM_DIAGNOSTICS = 1;
    }

    return browserify({
        entries: [sourcePathsMobile.libraryModuleScript],
        debug: debug
    })
        .bundle()
        .pipe(source(libraryName + '.js'))
        .pipe(gulp.dest(buildPathsMobile.scripts));

});

gulp.task('compile-library-templates', function () {

    console.log('Compiling templates...');

    gulp.src(sourcePaths.libraryTemplates)
        .pipe(rename(function (path) {
            path.dirname = 'templates';
        }))
        .pipe(templateCache(libraryName + '-templates.js', {
            module: libraryTemplatesModule,
            standalone: true,
            root: '/' + libraryName + '/'
        }))
        .pipe(gulp.dest(buildPaths.scripts));


    gulp.src(sourcePathsMobile.libraryTemplates)
        .pipe(rename(function (path) {
            path.dirname = 'templates';
        }))
        .pipe(templateCache(libraryName + '-templates.js', {
            module: libraryTemplatesModule,
            standalone: true,
            root: ''
        }))
        .pipe(gulp.dest(buildPathsMobile.scripts));
});


gulp.task('compile-library-styles', function () {

    console.log('Compiling styles...');

    gulp.src(sourcePaths.libraryStyles)
        // The onerror handler prevents Gulp from crashing when you make a mistake in your SASS
        .pipe(sass({
            errLogToConsole: true,
            sourceComments: 'map'
        }))
        .pipe(rename(function (path) {
            path.dirname = '';
        }))
        .pipe(concat(libraryName + '.css'))
        .pipe(gulp.dest(buildPaths.root));


    gulp.src(sourcePathsMobile.libraryStyles)
        // The onerror handler prevents Gulp from crashing when you make a mistake in your SASS
        .pipe(sass({
            errLogToConsole: true,
            sourceComments: 'map'
        }))
        .pipe(rename(function (path) {
            path.dirname = '';
        }))
        .pipe(concat(libraryName + '.css'))
        .pipe(gulp.dest(buildPaths.root));
});

gulp.task('compile-library-images', function () {

    console.log('Compiling images...');

    gulp.src(sourcePaths.libraryImages)
        .pipe(rename(function (path) {
            path.dirname = '';
        }))
        .pipe(gulp.dest(buildPaths.images));


    gulp.src(sourcePathsMobile.libraryImages)
        .pipe(rename(function (path) {
            path.dirname = '';
        }))
        .pipe(gulp.dest(buildPathsMobile.images));
});


gulp.task('compile-library',
    [ 'lint-library', 'browserify-library', 'browserify-library-mobile', 'compile-library-templates', 'compile-library-styles', 'compile-library-images'],
    function () {
        console.log('Compiling scripts...');

        // move index.html
        gulp.src(sourcePaths.index)
            .pipe(gulp.dest(buildPaths.scripts));

        gulp.src(sourcePaths.testIndex)
            .pipe(gulp.dest(buildPaths.scripts));

        gulp.src(sourcePathsMobile.index)
            .pipe(gulp.dest(buildPathsMobile.scripts));

        // move libraries
        gulp.src(['./src/client/lib/**/*.*'])
            .pipe(gulp.dest(buildPaths.root + '/lib'));
    });


gulp.task('compile-all', function (cb) {
    runSequence('clean-build', [
        'compile-library'
    ], cb);
});


// Prettifying
gulp.task('prettify', function () {
    gulp.src('./src/**/*.js')
        .pipe(prettify({
            'indent_size': 2,
            'indent_char': ' ',
            'space_in_paren': true,
            'indent_level': 0,
            'indent_with_tabs': false,
            'preserve_newlines': true,
            'max_preserve_newlines': 10,
            'jslint_happy': true,
            'brace_style': 'collapse',
            'keep_array_indentation': false,
            'keep_function_indentation': false,
            'space_before_conditional': true,
            'break_chained_methods': true,
            'eval_code': false,
            'unescape_strings': false,
            'wrap_line_length': 100
        }))
        .pipe(gulp.dest('./src/')); // edit in place
});

// Server scripts

gulp.task('start-server', function () {

    console.log('Starting server...');

    server.use(livereload({ port: livereloadport }));
    server.use(express.static(buildPaths.root));


    server.get('/', function (req, res) {
        res.sendFile(buildPaths.index, {
            root: buildPaths.root
        });
    });

    server.get('/mobile', function (req, res) {
        res.sendFile(buildPathsMobile.index, {
            root: buildPathsMobile.root
        });
    });

    server.listen(serverport);
    lrserver.listen(livereloadport);

});


gulp.task('refresh-server', function () {

    console.log('Refreshing server...');

    refresh(lrserver);
});


gulp.task('register-watchers', function (cb) {
    var i,
        registerAppWatchers;

    gulp.watch(sourcePaths.index, [ 'compile-library', 'refresh-server' ]);
    gulp.watch(sourcePaths.testIndex, [ 'compile-library', 'refresh-server' ]);
    gulp.watch(sourcePaths.libraryModuleScript, [ 'compile-library', 'refresh-server' ]);
    gulp.watch(sourcePaths.libraryScripts, [ 'compile-library', 'refresh-server' ]);
    gulp.watch(sourcePaths.libraryTemplates, [ 'compile-library-templates', 'refresh-server' ]);
    gulp.watch(sourcePaths.libraryStyles, [ 'compile-library-styles', 'refresh-server' ]);
    gulp.watch(sourcePaths.libraryImages, [ 'compile-library-images', 'refresh-server' ]);

    gulp.watch(sourcePathsMobile.index, [ 'compile-library', 'refresh-server' ]);
    gulp.watch(sourcePathsMobile.libraryModuleScript, [ 'compile-library', 'refresh-server' ]);
    gulp.watch(sourcePathsMobile.libraryScripts, [ 'compile-library', 'refresh-server' ]);
    gulp.watch(sourcePathsMobile.libraryTemplates, [ 'compile-library-templates', 'refresh-server' ]);
    gulp.watch(sourcePathsMobile.libraryStyles, [ 'compile-library-styles', 'refresh-server' ]);
    gulp.watch(sourcePathsMobile.libraryImages, [ 'compile-library-images', 'refresh-server' ]);

    return cb;
});

// Dev task
gulp.task('dev', [ 'compile-all' ], function (cb) {

    runSequence('start-server', 'register-watchers', cb);

});
