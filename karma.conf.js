//jshint strict: false
module.exports = function(config) {
  config.set({
    files: [
      "frontend/bower_components/html5-boilerplate/dist/js/vendor/modernizr-2.8.3.min.js",
      "frontend/bower_components/jquery/dist/jquery.slim.js",
      "frontend/bower_components/angular/angular.js",
      "frontend/bower_components/angular-resource/angular-resource.js",
      "frontend/bower_components/angular-mocks/angular-mocks.js",
      //"frontend/bower_components/angular-bootstrap/ui-bootstrap.js", // unused at the moment
      "src/*.module.js",
      "src/*!(.module|.spec).js",
      "src/**/*.module.js",
      "src/**/*!(.module|.spec).js",
      "src/**/*.spec.js"
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
