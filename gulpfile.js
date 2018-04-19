"use strict";

var gulp = require("gulp");
var concat = require("gulp-concat");
var modernizr = require('gulp-modernizr');
var ngAnnotate = require("gulp-ng-annotate");
var pump = require("pump");
var sourcemaps = require('gulp-sourcemaps');
var templateCache = require('gulp-angular-templatecache');
var uglify = require("gulp-uglify");
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

var js_sources = [
  "src/*.module.js",
  "src/!(*.spec).js",
  "src/!(bower_components)/**/*.module.js",
  "src/!(bower_components)/**/!(*.spec).js"];
var css_sources = [
  "src/*.css",
  "src/!(bower_components)/**/*.css"];
var angular_templates = "src/**/*.html";

gulp.task("default", ["js", "modernizr", "css", "template-cache", "lint"]);
gulp.task("min", ["js-min", "modernizr", "css", "template-cache"]);

gulp.task("watch", ["default"], function () {
  gulp.watch(js_sources, ["js", "lint"]);
  gulp.watch(angular_templates, ["template-cache"]);
  gulp.watch(css_sources, ["css"]);
});


gulp.task("modernizr", function(cb) {
  pump([
    gulp.src(js_sources),
    modernizr({
      "crawl": false,
      "tests": [],
      "options": [
        "setClasses"
      ]
    }),
    uglify(),
    gulp.dest("frontend")], cb);
});

gulp.task("js", function (cb) {
  pump([
    gulp.src(js_sources),
    sourcemaps.init(),
    ngAnnotate({single_quotes: false}),
    concat("bundle.js"),
    sourcemaps.write("."),
    gulp.dest("frontend")], cb);
});

gulp.task("js-min", function (cb) {
  pump([
    gulp.src(js_sources),
    sourcemaps.init(),
    ngAnnotate({single_quotes: false}),
    concat("bundle.js"),
    uglify(),
    sourcemaps.write("."),
    gulp.dest("frontend")], cb);
});

gulp.task("css", function (cb) {
  pump([
    gulp.src(css_sources),
    sourcemaps.init(),
    concat("bundle.css"),
    sourcemaps.write("."),
    gulp.dest("frontend")], cb);
});

gulp.task("template-cache", function (cb) {
  pump([
    gulp.src(angular_templates),
    templateCache("templates.js",
                  {
                    standalone: true,
                    module: "landmarkRegApp.templates"
                  }),
    gulp.dest("frontend")], cb);
});

gulp.task("lint", function () {
  return gulp.src(js_sources)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});
