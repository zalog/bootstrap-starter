'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cleancss = require('gulp-clean-css');
const header = require('gulp-header');
const del = require('del');
const browserSync = require('browser-sync').create();
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

const isProduction = (process.env.NODE_ENV === 'production') ? true : false;

const clean = () => del(
    [`${config.dist}/**/*`],
    {force: true}
);

const html = () => gulp.src(`${config.src}/*.html`)
    .pipe(gulp.dest(config.dist));

const js = () => gulp.src(`${config.src}/js/**/*.js`)
    .pipe(babel())
    .pipe(gulp.dest(`${config.dist}/js/`));

const css = () => {
    let stream = gulp.src(`${config.src}/scss/**/*.scss`)
        .pipe(sass({
            includePaths: ['./node_modules/']
        }).on('error', sass.logError))
        .pipe(postcss([
            autoprefixer()
        ]));

    if (isProduction) stream = stream
        .pipe(cleancss({
            level: 1
        }))
        .pipe(header(banner));

    stream
        .pipe(gulp.dest(`${config.dist}/css/`))
        .pipe(browserSync.stream());

    return stream;
};

const serve = () => browserSync.init({
    server: config.dist,
    notify: false,
    reloadDelay: 500,
    ghostMode: false
});

const watch = () => {
    gulp.watch(`${config.src}/*.html`)
        .on('change', copyFile);
    gulp.watch(`${config.src}/js/**/*.js`)
        .on('change', gulp.series(js));
    gulp.watch(`${config.src}/scss/**/*`)
        .on('change', gulp.series(css));

    gulp.watch([`${config.dest}/**/*`, `!${config.dest}/**/*.css`])
        .on('change', gulp.series(browserSync.reload));
};



const build = gulp.series(clean, html, js, css);



exports.build = build;
exports.serve = serve;
exports.default = gulp.parallel(
    gulp.series(build, serve),
    watch
);
