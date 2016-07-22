'use strict';

import del from 'del';
import gulp from 'gulp';
import config from './config';
import vinylPaths from 'vinyl-paths';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import gulpLoadPlugins from 'gulp-load-plugins';

const $ = gulpLoadPlugins();

gulp.task('clean-template-cache', () => gulp
  .src(`${config.pathTemplateDist}/${config.templateCacheName}.js`)
  .pipe($.plumber())
  .pipe(vinylPaths(del)));

gulp.task('clean-html', () => gulp
  .src(`${config.pathHtmlDist}/*.html`)
  .pipe($.plumber())
  .pipe(vinylPaths(del)));

gulp.task('clean-css', () => gulp
  .src(`${config.pathCssDist}/*.css`)
  .pipe($.plumber())
  .pipe(vinylPaths(del)));

gulp.task('clean-js', () => gulp
  .src([
    `${config.pathJsDist}/*.js`,
    `${config.pathJsDist}/*.map`,
    `!${config.pathJsDist}/*-tpl.js`,
    `!${config.pathVendorDist}/**/*`
  ])
  .pipe($.plumber())
  .pipe(vinylPaths(del)));

gulp.task('clean', [
  'clean-js',
  'clean-css',
  'clean-sass-imports',
  'clean-template-cache'
]);

gulp.task('babel-config', () => config.loadBabel());


gulp.task('build-vendor', () => gulp
  .src(config.patternVendor)
  .pipe($.sourcemaps.init())
  .pipe($.plumber())
  .pipe($.uglify())
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest(config.pathVendorDist)));

gulp.task('build-js', [
  'lint-js',
  'clean-js',
  'babel-config'
], () => gulp
  .src(([config.patternJs]))
  .pipe($.plumber())
  .pipe($.sourcemaps.init())
  .pipe($.babel(config.babel))
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest(`${config.pathJsDist}`)));

gulp.task('build-sass', ['clean-css'], () => gulp
  .src(config.patternSass)
  .pipe($.sourcemaps.init())
  .pipe($.plumber())
  .pipe($.sass())
  .on('error', $.util.log)
  .pipe($.autoprefixer({
    browsers: ['last 2 versions'],
    cascade: false
  }))
  .pipe($.cleanCss())
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest(config.pathCssDist)));

gulp.task('build', [
  'build-js', 'build-sass', 'build-html', 'build-template-cache', 'build-vendor'
]);


gulp.task('eslint-config', () => config.loadEsLint());

gulp.task('lint-js', ['eslint-config'], () => gulp
    .src(`${config.pathSrc}`)
    .pipe($.plumber())
    .pipe($.eslint(config.eslint))
    .pipe($.eslint.format()));

gulp.task('lint', ['lint-js']);

gulp.task('watch-template', ['build-js'], browserSync.reload);
gulp.task('watch-html', ['build-html'], browserSync.reload);
gulp.task('watch-sass', ['build-sass'], browserSync.reload);
gulp.task('watch-js', ['build-js'], browserSync.reload);

gulp.task('watch', () => {
  gulp.watch(config.patternJs, ['watch-js']);
  gulp.watch(config.patternSass, ['watch-sass']);
  gulp.watch(config.patternHtml, ['watch-html']);
  gulp.watch(config.patternTemplate, ['watch-template']);
});

gulp.task('build-html', ['clean-html'], () => gulp
  .src(config.patternHtml)
  .pipe($.plumber())
  .pipe(gulp.dest(config.pathHtmlDist)));

gulp.task('build-template-cache', ['clean-template-cache'], () => gulp
  .src(config.patternTemplate)
  .pipe($.plumber())
  .pipe($.angularTemplatecache(`${config.templateCacheName}.js`, {
    module : 'template-cache',
    standalone : true,
    root : './template',
    moduleSystem : 'IIFE'
  }))
  .pipe(gulp.dest(config.pathTemplateDist)));

gulp.task('test', () => {
  gulp
  .src('karma.conf.js')
  .pipe($.karma())
  .on('error', function (error) {
    $.util.log(error);
    this.emit('end');
  })
});

gulp.task('server-dev', () => {
  browserSync.init({
    server: {
      port : config.serverPort,
      baseDir : config.pathDist
    }
  })
});

gulp.task('start', (cb) => runSequence(
  'build',
  ['test', 'watch'],
  'server-dev',
  cb
));

gulp.task('deploy-demo', ['build'], () => gulp
  .src(config.patternDemo)
  .pipe($.ghPages({
    force : true
  })));

gulp.task('default', ['start']);

$.npmScriptSync(gulp);
