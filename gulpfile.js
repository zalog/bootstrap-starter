'use strict';

const gulp = require('gulp');
const csscompile = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const header = require('gulp-header');
const rename = require('gulp-rename');
const del = require('del');
const browsersync = require('browser-sync').create();
const gulputil = require('gulp-util');

const packageJson = require('./package.json');

const config = {
    src: './src',
    dist: './dist'
};

const bannerContributors = (function() {
    if ( typeof packageJson.contributors === 'undefined' ) return false;

    let output = '';
    for (let i = 0; i < packageJson.contributors.length; i++) {
        if ( i > 0 ) output += ', ';
        output += packageJson.contributors[i];
    }

    return ` * Contributors: ${output}`;
})();
let banner = [
    '/**',
    ` * ${packageJson.name} v${packageJson.version}`,
    ` * Author: ${packageJson.author}`,
    ` * License: ${packageJson.license}`
];
if ( bannerContributors ) banner.push(bannerContributors);
banner.push(' **/', '');
banner = banner.join('\n');

const copyFile = (file) => {
    if (!file) return;

    return gulp.src(file, {base: config.src})
        .pipe(gulp.dest(config.dist))
        .on('end', () => gulputil.log('Finished', `'${gulputil.colors.cyan('copyFile')}'`, file));
};



const clean = () => del(
    [`${config.dist}/**/*`],
    {force: true}
);

const html = () => gulp.src(`${config.src}/*.html`)
    .pipe(gulp.dest(config.dist));

const cssCompile = () => gulp.src(`${config.src}/scss/compile.scss`)
    .pipe(csscompile({includePaths: ['./node_modules/']}))
    .pipe(rename('style.css'))
    .pipe(gulp.dest(`${config.dist}/css/`))
    .pipe(browsersync.stream());

const cssOptimize = () => gulp.src(`${config.dist}/css/style.css`)
    .pipe(postcss([
        autoprefixer(),
        cssnano()
    ]))
    .pipe(header(banner))
    .pipe(gulp.dest(`${config.dist}/css/`));

const css = gulp.series(cssCompile, cssOptimize);

const serve = () => browsersync.init({
    server: config.dist,
    notify: false,
    reloadDelay: 500,
    ghostMode: false
});

const watch = () => {
    gulp.watch(`${config.src}/*.html`).on('change', copyFile);
    gulp.watch(`${config.src}/scss/**/*`).on('change', cssCompile);

    gulp.watch(`${config.dist}/*.html`).on('change', browsersync.reload);
};



// grouped tasks by use case
const dev = gulp.parallel(html, cssCompile);
const build = gulp.series(clean, html, css);



exports.build = build;
exports.serve = serve;
exports.default = gulp.parallel(
    gulp.series(dev, serve),
    watch
);
