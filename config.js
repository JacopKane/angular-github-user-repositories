'use strict';

import fs from 'fs-promise';

let
  pathBase = '.',
  pathSrc = `${pathBase}/src`,
  pathVendor = `${pathBase}/node_modules`,
  pathSass = `${pathSrc}/scss`,
  pathTemplate = `${pathSrc}/template`,
  pathHtml = `${pathSrc}/html`,
  pathJs = `${pathSrc}/js`,
  pathDist = `${pathBase}/dist`,
  pathDemo = `${pathDist}`,
  pathJsDist = `${pathDist}/js`,
  pathVendorDist = `${pathJsDist}/vendor`,
  pathCssDist = `${pathDist}/css`,
  pathTemplateDist = pathJsDist,
  pathHtmlDist = `${pathDist}`,
  patternSass = `${pathSass}/**/*.scss`,
  patternTemplate = `${pathTemplate}/**/*.html`,
  patternHtml = `${pathSrc}/**/*.html`,
  patternJs = `${pathJs}/**/*.js`,
  patternDemo = `${pathDemo}/**/*`,
  patternVendor = [`${pathVendor}/angular/**/angular.js`];

export const config = {
  pathBase,
  pathSrc,
  pathSass,
  pathHtml,
  pathDemo,
  pathTemplate,
  pathJs,
  pathDist,
  pathJsDist,
  pathCssDist,
  pathHtmlDist,
  patternSass,
  patternHtml,
  patternJs,
  patternTemplate,
  pathTemplateDist,
  patternVendor,
  pathVendorDist,
  patternDemo,
  serverPort : 9191,
  templateCacheName : 'app-tpl',
  package : require(`${pathBase}/package.json`),
  babel : {},
  eslint : {},
  loadBabel : () => fs
    .readFile(`${pathBase}/.babelrc`, 'utf8')
    .then((content) => config.babel = JSON.parse(content)),
  loadEsLint : () => fs
    .readFile(`${pathBase}/.eslintrc`, 'utf8')
    .then((content) => config.eslint = JSON.parse(content))
};

export default config;

