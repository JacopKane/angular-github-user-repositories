'use strict';

import del from 'del';
import gulp from 'gulp';
import karma from 'karma';
import config from './config';
import vinylPaths from 'vinyl-paths';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';

const

  $ = gulpLoadPlugins(),

  getEnv = () => process.env.NODE_ENV,

  errorLog = (message = 'Unknown', prefix = 'Error') => {

    prefix = prefix !== false ? $.util.colors.yellow(`[${prefix}] : `) : '';
    message = $.util.colors.red(`${message}\n`);

    return $.util.log(`${prefix}${message}`);
  },

  errorHandler = function (error, prefix) {
    errorLog(error, prefix);
    this.emit('end');
  },

  startKarma = (callback = undefined, exitOnError = false) => new karma.Server({
    configFile : config.pathKarma,
    autoWatch : false,
    singleRun : true
  }, exitOnError ? callback : (status) => {
    if (status) {
      errorLog('Karma couldn\'t pass tests', 'karma');
    }
    callback();
  }).start();

gulp.task('babel-config', () => config.loadBabel());

gulp.task('eslint-config', () => config.loadEsLint());

gulp.task('clean-template-cache', () => gulp
  .src(`${config.pathTemplateDist}/${config.templateCacheName}.js`)
  .pipe($.plumber({ errorHandler }))
  .pipe(vinylPaths(del)));

gulp.task('clean-html', () => gulp
  .src(`${config.pathHtmlDist}/*.html`)
  .pipe($.plumber({ errorHandler }))
  .pipe(vinylPaths(del)));

gulp.task('clean-css', () => gulp
  .src(`${config.pathCssDist}/*.css`)
  .pipe($.plumber({ errorHandler }))
  .pipe(vinylPaths(del)));

gulp.task('clean-js', () => gulp
  .src([
    config.patternJsDist,
    `${config.pathJsDist}/*.map`,
    `!${config.pathJsDist}/*-tpl.js`,
    `${config.pathVendorDist}/**/*`
  ])
  .pipe($.plumber({ errorHandler }))
  .pipe(vinylPaths(del)));

gulp.task('clean', [
  'clean-js',
  'clean-css',
  'clean-html',
  'clean-template-cache'
]);

gulp.task('lint-js', ['eslint-config'], () => gulp
  .src(config.patternJs)
  .pipe($.cached('lint-js'))
  .pipe($.eslint(config.eslint))
  .pipe($.eslint.failAfterError()));

gulp.task('lint-js-watch', ['eslint-config'], () => gulp
  .src(config.patternJs)
  .pipe($.cached('lint-js-watch'))
  .pipe($.plumber({ errorHandler }))
  .pipe($.eslint(config.eslint))
  .pipe($.eslint.format()));

gulp.task('lint', ['lint-js']);
gulp.task('lint-watch', ['lint-js-watch']);

gulp.task('test-unit', (callback) => startKarma(callback, true));
gulp.task('test-unit-watch', (callback) => startKarma(callback));

gulp.task('test', ['clean', 'lint'], (callback) => runSequence(
  'build',
  'test-unit',
  callback
));

gulp.task('test-watch', ['test-unit-watch']);

gulp.task('server-dev-reload', () => browserSync.reload());

gulp.task('server-dev', () => browserSync.init({
  server: {
    port : config.serverPort,
    baseDir : config.pathDist
  }
}));

gulp.task('build-vendor', () => gulp
  .src(config.patternVendor)
  .pipe($.cached('build-vendor'))
  .pipe($.sourcemaps.init())
  .pipe($.plumber({ errorHandler }))
  .pipe($.ngAnnotate())
  .pipe(getEnv() === 'production' ? $.uglify() : $.util.noop())
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest(config.pathVendorDist)));

gulp.task('build-js', ['environment-set', 'babel-config'], () => gulp
  .src((config.patternJs))
  .pipe($.cached('build-js'))
  .pipe($.plumber({ errorHandler }))
  .pipe($.sourcemaps.init())
  .pipe($.preprocess({ context : {
    environment : getEnv()
  }}))
  .pipe($.babel(config.babel))
  .pipe($.ngAnnotate())
  .pipe(getEnv() === 'production' ? $.uglify() : $.util.noop())
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest(config.pathJsDist)));

gulp.task('build-sass', () => gulp
  .src(config.patternSass)
  .pipe($.cached('build-sass'))
  .pipe($.sourcemaps.init())
  .pipe($.plumber({ errorHandler }))
  .pipe($.sass())
  .on('error', errorHandler)
  .pipe($.autoprefixer({
    browsers: ['last 2 versions'],
    cascade: false
  }))
  .pipe(getEnv() === 'production' ? $.cleanCss() : $.util.noop())
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest(config.pathCssDist)));

gulp.task('build', (callback) => runSequence([
  'build-js',
  'build-sass',
  'build-html',
  'build-vendor',
  'build-template-cache'
], callback));

gulp.task('build-html', () => gulp
  .src(config.patternHtml)
  .pipe($.cached('build-html'))
  .pipe($.plumber({ errorHandler }))
  .pipe(gulp.dest(config.pathHtmlDist)));

gulp.task('build-template-cache', () => gulp
  .src(config.patternTemplate)
  .pipe($.cached('build-template-cache'))
  .pipe($.plumber({ errorHandler }))
  .pipe($.angularTemplatecache(`${config.templateCacheName}.js`, {
    module : 'template-cache',
    standalone : true,
    root : './template',
    moduleSystem : 'IIFE'
  }))
  .pipe($.sourcemaps.init())
  .pipe(getEnv() === 'production' ? $.uglify() : $.util.noop())
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest(config.pathTemplateDist)));

gulp.task('watch-template', [
  'build-template-cache'
], (callback) => runSequence('server-dev-reload', callback));

gulp.task('watch-html', [
  'build-html'
], (callback) => runSequence('server-dev-reload', callback));

gulp.task('watch-sass', [
  'build-sass'
], (callback) => runSequence('server-dev-reload', callback));

gulp.task('watch-js', [
  'build-js',
  'lint-js-watch'
], (callback) => runSequence(['test-unit-watch', 'server-dev-reload'], callback));

gulp.task('watch-test', [
  'build-js',
  'lint-js-watch',
  'build-template-cache'
], (callback) => runSequence(
  ['test-unit-watch', 'server-dev-reload'],
  callback
));

gulp.task('watch', () => {
  gulp.watch(config.patternSpec, ['watch-test']);
  gulp.watch(config.patternJs, ['watch-js']);
  gulp.watch(config.patternSass, ['watch-sass']);
  gulp.watch(config.patternHtml, ['watch-html']);
  gulp.watch(config.patternTemplate, ['watch-template']);
});

gulp.task('environment-set', () => process
  .env.NODE_ENV = getEnv() || 'development');

gulp.task('environment-set-development', () => process
  .env.NODE_ENV = 'development');

gulp.task('environment-set-production', () => process
  .env.NODE_ENV = 'production');

gulp.task('prepare-demo', ['test'], () => gulp
  .src(config.patternDemo)
  .pipe($.ghPages({
    force : true
  })));

gulp.task('deploy-demo', (callback) => runSequence(
  'environment-set-production',
  'prepare-demo',
  'environment-set',
  callback
));

gulp.task('start', ['environment-set'], (callback) => runSequence(
  ['lint-watch', 'clean'],
  ['build'],
  ['test-watch', 'watch', 'server-dev'],
  'server-dev-reload',
  callback
));

gulp.task('default', ['start']);

$.npmScriptSync(gulp);
