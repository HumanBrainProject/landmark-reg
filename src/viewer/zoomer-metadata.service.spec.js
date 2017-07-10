"use strict";

describe("landmarkRegApp.viewer module", function() {
  beforeEach(module("landmarkRegApp.viewer"));

  describe("ZoomerMetadata service", function() {
    var $httpBackend;
    var ZoomerMetadata;

    var test_metadata = {
      "size": [6572, 7404, 5711],
      "voxel_size": [0.021166666666666666, 0.020, 0.021166666666666666],
      "max_level": 6,
      "tile_size": 256
    };

    beforeEach(function() {
      jasmine.addCustomEqualityTester(angular.equals);
    });
    beforeEach(inject(function(_$httpBackend_, _ZoomerMetadata_) {
      $httpBackend = _$httpBackend_;
      ZoomerMetadata = _ZoomerMetadata_;
    }));
    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it("should fetch metadata from zoomer-info.json",
       function() {
         $httpBackend
           .expectGET("/test/zoomer-info.json")
           .respond(test_metadata);

         var result_data;
         ZoomerMetadata.fetch_metadata("/test")
           .then(function(response){ result_data = response; });
         $httpBackend.flush();
         expect(result_data).toEqual(test_metadata);
       });
  it("should report failure to fetch zoomer-info.json",
     function() {
       $httpBackend
         .expectGET("/nonexistent/zoomer-info.json")
         .respond(404, "");
       var error_spy = jasmine.createSpy("error callback")
       ZoomerMetadata.fetch_metadata("/nonexistent")
         .catch(error_spy);
       $httpBackend.flush();
       expect(error_spy).toHaveBeenCalledTimes(1);
     });
  it("should return static info as a $q promise",
     inject(function($rootScope) {
       var spy = jasmine.createSpy();
       ZoomerMetadata.fetch_metadata("http://www.nesys.uio.no/CDPTest/data")
         .then(spy);
       // Propagate promise resolution to 'then' functions using $apply().
       $rootScope.$apply();
       expect(spy).toHaveBeenCalledTimes(1);
     }));
  });
});
