(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.config")
    .constant("CONFIG", {
      // backend_url: "https://ylep.pythonanywhere.com/api",
      backend_url: "http://imedv02.ime.kfa-juelich.de:5088/api",
      neuroglancer_instance_url: "https://jubrain.fz-juelich.de/apps/neuroglancer/",
      dataset_list_sources: [
        "datasets.json",
        "https://www.jubrain.fz-juelich.de/apps/landmark-reg/data/datasets.json"
      ],
      default_template: {
        zoomer_url: "https://www.jubrain.fz-juelich.de/apps/landmark-reg/data/BigBrain-160um",
        neuroglancer_url: "precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/BigBrainRelease.2015/image"
      },
      default_incoming: {
        zoomer_url: "https://www.jubrain.fz-juelich.de/apps/landmark-reg/data/B20_stn_l",
        neuroglancer_url: "precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/B20_stn_l/isotropic-raw"
      },
      default_template_nehuba_initialNgState : {
        "layers": {
          "template": {
            "type": "image",
            "source": "precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/BigBrainRelease.2015/image",
            "transform": [
              [
                1,
                0,
                0,
                -70677184
              ],
              [
                0,
                1,
                0,
                -70010000
              ],
              [
                0,
                0,
                1,
                -58788284
              ],
              [
                0,
                0,
                0,
                1
              ]
            ]
          }
        },
        "navigation": {
          "pose": {
            "position": {
              "voxelSize": [
                21166.666015625,
                20000,
                21166.666015625
              ],
              "voxelCoordinates": [
                -21.8844051361084,
                16.288618087768555,
                28.418994903564453
              ]
            }
          },
          "zoomFactor": 350000
        },
        "perspectiveOrientation": [
          0.3140767216682434,
          -0.7418519854545593,
          0.4988985061645508,
          -0.3195493221282959
        ],
        "perspectiveZoom": 1922235.5293810747
      },
      default_template_nehuba: {
        "configName": "BigBrain",
        "globals": {
          "hideNullImageValues": true,
          "useNehubaLayout": {
            "keepDefaultLayouts": false
          },
          "useNehubaMeshLayer": true,
          "embedded": true,
          "rightClickWithCtrlGlobal": false,
          "zoomWithoutCtrlGlobal": false,
          "useCustomSegmentColors": true
        },
        "zoomWithoutCtrl": true,
        "rightClickWithCtrl": true,
        "rotateAtViewCentre": true,
        "enableMeshLoadingControl": true,
        "zoomAtViewCentre": true,
        "restrictUserNavigation": true,
        "disableSegmentSelection": true,
        "dataset": {
          "imageBackground": [
            1,
            1,
            1,
            1
          ],
          "initialNgState": {
          }
        },
        "layout": {
          "views": "hbp-neuro",
          "planarSlicesBackground": [
            1,
            1,
            1,
            1
          ],
          "useNehubaPerspective": {
            "enableShiftDrag": false,
            "doNotRestrictUserNavigation": false,
            "perspectiveSlicesBackground": [
              1,
              1,
              1,
              1
            ],
            "removePerspectiveSlicesBackground": {
              "color": [
                1,
                1,
                1,
                1
              ],
              "mode": "=="
            },
            "perspectiveBackground": [
              1,
              1,
              1,
              1
            ],
            "fixedZoomPerspectiveSlices": {
              "sliceViewportWidth": 300,
              "sliceViewportHeight": 300,
              "sliceZoom": 563818.3562426177,
              "sliceViewportSizeMultiplier": 2
            },
            "mesh": {
              "backFaceColor": [
                1,
                1,
                1,
                1
              ],
              "removeBasedOnNavigation": true,
              "flipRemovedOctant": true
            },
            "centerToOrigin": true,
            "drawSubstrates": {
              "color": [
                0,
                0,
                0.5,
                0.15
              ]
            },
            "drawZoomLevels": {
              "cutOff": 200000,
              "color": [
                0.5,
                0,
                0,
                0.15
              ]
            },
            "hideImages": false,
            "waitForMesh": true,
            "restrictZoomLevel": {
              "minZoom": 1200000,
              "maxZoom": 3500000
            }
          }
        }
      },
      default_incoming_nehuba_initialNgState : {
        "layers": {
          "incoming": {
            "type": "image",
            "source": "precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/B20_stn_l/isotropic-raw",
            "transform": [
              [
                1,
                0,
                0,
                0
              ],
              [
                0,
                1,
                0,
                0
              ],
              [
                0,
                0,
                1,
                0
              ],
              [
                0,
                0,
                0,
                1
              ]
            ]
          }
        }
      },
      default_incoming_nehuba: {

        "zoomWithoutCtrl": true,
        "rightClickWithCtrl": true,
        "rotateAtViewCentre": true,
        "enableMeshLoadingControl": true,
        "zoomAtViewCentre": true,
        "restrictUserNavigation": true,
        "disableSegmentSelection": true,
        "dataset": {
          "imageBackground": [
            1,
            1,
            1,
            1
          ],
          "initialNgState": {
          }
        },
        "layout": {
          "views": "hbp-neuro",
          "planarSlicesBackground": [
            1,
            1,
            1,
            1
          ],
          "useNehubaPerspective": {
            "enableShiftDrag": false,
            "doNotRestrictUserNavigation": false,
            "perspectiveSlicesBackground": [
              1,
              1,
              1,
              1
            ],
            "removePerspectiveSlicesBackground": {
              "color": [
                1,
                1,
                1,
                1
              ],
              "mode": "=="
            },
            "perspectiveBackground": [
              1,
              1,
              1,
              1
            ],
            "fixedZoomPerspectiveSlices": {
              "sliceViewportWidth": 300,
              "sliceViewportHeight": 300,
              "sliceZoom": 563818.3562426177,
              "sliceViewportSizeMultiplier": 2
            },
            "mesh": {
              "backFaceColor": [
                1,
                1,
                1,
                1
              ],
              "removeBasedOnNavigation": true,
              "flipRemovedOctant": true
            },
            "centerToOrigin": true,
            "drawSubstrates": {
              "color": [
                0,
                0,
                0.5,
                0.15
              ]
            },
            "drawZoomLevels": {
              "cutOff": 200000,
              "color": [
                0.5,
                0,
                0,
                0.15
              ]
            },
            "hideImages": false,
            "waitForMesh": true,
            "restrictZoomLevel": {
              "minZoom": 1200000,
              "maxZoom": 3500000
            }
          }
        }
      }
    });

})(); /* IIFE */
