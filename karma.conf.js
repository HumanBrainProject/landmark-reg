//jshint strict: false
module.exports = function(config) {
  config.set({

    basePath: "./app",

    files: [
      "bower_components/angular/angular.js",
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-mocks/angular-mocks.js',
      "bower_components/angular-bootstrap/ui-bootstrap.js",
      "!(bower_components)/**.module.js",
      "!(bower_components)/**!(.module|.spec).js",
      "!(bower_components)/**.spec.js"
    ],

    autoWatch: true,

    frameworks: ["jasmine"],

    browsers: ["Firefox", "Chrome"],

    plugins: [
      "karma-chrome-launcher",
      "karma-firefox-launcher",
      "karma-jasmine",
      "karma-junit-reporter"
    ],

    junitReporter: {
      outputFile: "test_out/unit.xml",
      suite: "unit"
    }

  });
};
