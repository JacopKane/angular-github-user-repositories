module.exports = function(config) {
  config.set({
    basePath: '.',
    files: [
      'dist/js/vendor/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'dist/js/github-user-repositories.js',
      'dist/js/app-tpl.js',
      'dist/js/app.js',
      'test/**/*.js'
    ],
    frameworks: ['jasmine'],
    port: 9876,
    colors: true,
    logLevel : config.LOG_INFO,
    autoWatch : true,
    browsers : ['PhantomJS'],
    singleWatch : false,
    reporter : ['spec']
  });
};
