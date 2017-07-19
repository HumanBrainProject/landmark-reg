"use strict";

var gulp = require("gulp");
var concat = require("gulp-concat");
var ngAnnotate = require("gulp-ng-annotate");
var pump = require("pump");
var sourcemaps = require('gulp-sourcemaps');
var templateCache = require('gulp-angular-templatecache');
var uglify = require("gulp-uglify");

var js_sources = [
  "src/*.module.js",
  "src/!(*.spec).js",
  "src/!(bower_components)/**/*.module.js",
  "src/!(bower_components)/**/!(*.spec).js"];
var angular_templates = "src/**/*.html";

gulp.task("default", ["js", "template-cache"]);

gulp.task("watch", ["js", "template-cache"], function () {
  gulp.watch(js_sources, ["js"]);
  gulp.watch(angular_templates, ["template-cache"]);
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
