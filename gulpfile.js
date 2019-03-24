const babel = require('gulp-babel');
const del = require('del');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const injectPartials = require('gulp-inject-partials');
const merge = require('merge-stream');
const preprocess = require("gulp-preprocess");
const sass = require('gulp-sass');
const webServer = require('gulp-webserver');

const gulpHelper = require('./gulpfilehelper');

////////////////////////////////////////////////////////////////////////////////

const environments = ['local', 'development', 'qa', 'producation'];

const environment = environments.indexOf(process.env.NODE_ENV) !== -1
	? process.env.NODE_ENV : environments[0];

////////////////////////////////////////////////////////////////////////////////

const package = gulpHelper.completePackage(require('./package.json'), environments);

////////////////////////////////////////////////////////////////////////////////

function clearDist() {
	return del('./dist/');
}

////////////////////////////////////////////////////////////////////////////////

function addVendors() {
	const streams = [];

	package.vendors = package.vendors || {};
	for (const vendor in package.vendors) {
		if (package.vendors[vendor] != null && package.vendors[vendor][environment] != null
			&& package.vendors[vendor][environment].src != null && package.vendors[vendor][environment].dest != null) {

			streams.push(gulp.src(package.vendors[vendor][environment].src)
				.pipe(gulp.dest(package.vendors[vendor][environment].dest)));
		}
	}

	if (streams.length > 0) {
		return merge(streams);
	}

	return Promise.resolve();
}

////////////////////////////////////////////////////////////////////////////////

function buildStyles() {
	return gulp.src('./src/**/*.scss', { since: gulp.lastRun(buildStyles) })
		.pipe(preprocess({ context: package.preprocess[environment] || {} }))
		.pipe(sass())
		.pipe(gulp.dest('./dist/'));
}

function buildScripts() {
	return gulp.src('./src/**/*.js', { since: gulp.lastRun(buildScripts) })
	.pipe(preprocess({ context: package.preprocess[environment] || {} }))
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(babel())
		.pipe(gulp.dest('./dist/'));
}

function buildWebPages() {
	return gulp.src(['./src/*.html', '!./src/**/*.template.html'], { since: gulp.lastRun(buildWebPages) })
		.pipe(injectPartials())
		.pipe(preprocess({ context: package.preprocess[environment] || {} }))
		.pipe(gulp.dest('./dist/'));
}

////////////////////////////////////////////////////////////////////////////////

exports.default = gulp.series(clearDist, gulp.parallel(addVendors, buildStyles, buildScripts, buildWebPages));

function watch() {
	gulp.watch(['./src/**/*.scss'], buildStyles);
	gulp.watch('./src/**/*.js', buildScripts);
	gulp.watch('./src/**/*.html', buildWebPages);
}

exports.watch = gulp.series(exports.default, watch);

function serve() {
	gulp.src('./dist').pipe(webServer({
		directoryListing: { enable: true, path: './dist' },
		livereload: true,
		open: true,
		port: process.env.PORT || 8080
	}));
}

exports.serve = gulp.series(exports.default, watch, serve);
