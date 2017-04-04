"use strict";

var gulp = require("gulp");
var concat = require("gulp-concat");
var ngAnnotate = require("gulp-ng-annotate");
//var uglify = require("gulp-uglify");
var sourcemaps = require('gulp-sourcemaps');
var templateCache = require('gulp-angular-templatecache');

gulp.task("default", ["js", "template-cache"]);
gulp.task("watch", ["js", "template-cache"], function () {
  gulp.watch("src/**/*.js", ["js"]);
  gulp.watch("src/**/*.html", ["template-cache"]);
});

gulp.task("js", function () {
  gulp.src(["src/*.module.js",
            "src/*.js",
            "src/!(bower_components)/**/*.module.js",
            "src/!(bower_components)/**/!(*.spec).js"])
    .pipe(sourcemaps.init())
      .pipe(concat("bundle.js"))
      .pipe(ngAnnotate({single_quotes: false}))
      // .pipe(uglify())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("frontend"));
});

gulp.task("template-cache", function () {
  return gulp.src("src/**/*.html")
    .pipe(templateCache("templates.js",
                        {
                          standalone: true,
                          module: "landmarkRegApp.templates"
                        }))
    .pipe(gulp.dest("frontend"));
});
