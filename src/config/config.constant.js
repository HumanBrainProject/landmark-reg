(function() { /* IIFE */
  "use strict";

  angular
    .module("landmarkRegApp.config")
    .constant("CONFIG", {
      backend_url: "https://ylep.pythonanywhere.com/api",
      neuroglancer_instance_url: "https://jubrain.fz-juelich.de/apps/neuroglancer/",
      dataset_list_sources: [
        "/datasets.json",
        "https://www.jubrain.fz-juelich.de/apps/landmark-reg/data/datasets.json"
      ],
      default_template: {
        zoomer_url: "https://www.jubrain.fz-juelich.de/apps/landmark-reg/data/BigBrain-160um",
        neuroglancer_url: "precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/BigBrainRelease.2015/image"
      },
      default_incoming: {
        zoomer_url: "https://www.jubrain.fz-juelich.de/apps/landmark-reg/data/B20_stn_l",
        neuroglancer_url: "precomputed://https://www.jubrain.fz-juelich.de/apps/neuroglancer/B20_stn_l/isotropic-raw"
      }
    });
})(); /* IIFE */
