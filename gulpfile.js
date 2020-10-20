'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');

/**
 * Load the sample in src/app/index
 */
gulp.task('start', ['compile'], function (done) {
    var bs = browserSync.create('Essential JS2');
    var options = {
        server: {
            baseDir: ['./src', './'],
            directory: true
        },
        ui: false,
        open: false,
        notify: false
    };
    bs.init(options, done);

    /**
    * Watching typescript file changes
    */
    gulp.watch('src/**/*.ts', ['compile', bs.reload]);
});

/** 
 * Compile TypeScript to JS
 */
gulp.task('compile', function (done) {
    var ts = require('gulp-typescript');
    var defaultConfig = { typescript: require('typescript') };
    var tsProject = ts.createProject('tsconfig.json', defaultConfig);
    var tsResult = gulp.src(['./src/**/*.ts'], { base: '.' })
        .pipe(tsProject())
        .pipe(gulp.dest('./'))
        .on('error', function (e) {
            done(e);
            process.exit(1);
        }).on('end', function () {
            done();
        });
});

/**
 * Testing spec files
 */
var protractor = require('gulp-protractor').protractor;
var webdriver_standalone = require('gulp-protractor').webdriver_standalone;
var webdriver_update = require('gulp-protractor').webdriver_update_specific;

gulp.task('e2e-webdriver-update', webdriver_update({ webdriverManagerArgs: ['--ie', '--edge'] }));

gulp.task('e2e-webdriver-start', webdriver_standalone);

gulp.task('e2e-test', function (done) {
    runSequence('compile', 'e2e-ci-test', done);
});

gulp.task('e2e-ci-test', function (done) {
    var bs = browserSync.create('Essential JS2 E2E');
    var options = {
        server: {
            baseDir: ['./src', './'],
            directory: true
        },
        ui: false,
        open: false,
        notify: false
    };
    bs.init(options, function () {
        gulp.src(['./spec/**/*.spec.js'])
            .pipe(protractor({ configFile: 'e2e/protractor.config.js' }))
            .on('error', function (e) {
                console.error('Error: ' + e.message);
                done(e);
                process.exit(1);
            })
            .on('end', function () {
                done();
                process.exit(0);
            });
    });
});
