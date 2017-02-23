//jshint strict: false
module.exports = function(config) {
  config.set({

    basePath: "./app",

    files: [
      "bower_components/angular/angular.js",
      'bower_components/angular-mocks/angular-mocks.js',
      "bower_components/angular-bootstrap/ui-bootstrap.js",
      "components/**/*.module.js",
      "components/**/*!(.module|.spec).js",
      "components/**/*.spec.js"
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
