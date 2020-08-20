define([
  "app/config",
  "app/renderers",
  "esri/Map",
  "esri/geometry/SpatialReference",
  "app/tin",
  "esri/views/SceneView",
  "esri/Graphic",
  "esri/geometry/Point",
  "esri/geometry/Extent",
  "esri/layers/GraphicsLayer",
  "esri/layers/FeatureLayer",
  "esri/core/watchUtils",
  "esri/geometry/support/meshUtils",
  "esri/widgets/Editor",
  "app/utils"
], function (
  config,
  renderers,
  Map,
  SpatialReference,
  tin,
  SceneView,
  Graphic,
  Point,
  Extent,
  GraphicsLayer,
  FeatureLayer,
  watchUtils,
  meshUtils,
  Editor,
  utils
  ) {
  return {
    init: function () {

      const map = new Map({
        ground: {
          opacity: 0
        }
      });

      const view = new SceneView({
        container: "viewDiv",
        map: map,
        alphaCompositingEnabled: true,
        environment: {
          lighting: {
            directShadowsEnabled: false
          },
          background: {
            type: "color",
            color: [0, 0, 0, 0]
          },
          starsEnabled: false,
          atmosphereEnabled: false
        },
        camera: {
          position: {
            spatialReference: SpatialReference.WebMercator,
            x: -13544760.660733627,
            y: 5631669.443869304,
            z: 17097.244095640333
          },
          heading: 0,
          tilt: 72
        },
        spatialReference: SpatialReference.WebMercator,
        viewingMode: "local",
        qualityProfile: "high",
        clippingArea: config.extent
      });

      //view.on("click", function(event) {
      //  console.log(view.camera)
      //});

      tin.createGeometry()
        .then(function (mesh) {
          const graphic = new Graphic({
            geometry: mesh,
            symbol: {
              type: "mesh-3d",
              symbolLayers: [{ type: "fill" }]
            }
          });

          view.graphics.add(graphic);

          // Create elevation sampler to add z values to
          // to features in layer
          // meshUtils.createElevationSampler(mesh)
          //   .then(function(sampler) {

          //     const layer = new FeatureLayer({
          //       url: "https://services1.arcgis.com/UwIZajkvy9eyvgek/arcgis/rest/services/ski_trails_mt_hood/FeatureServer"
          //     });

          //     utils.setZValues(layer, sampler, 0);
          //   });

          view.when(function() {

            view.popup.autoOpenEnabled = false; //disable popups
            // Create the Editor
            //var editor = new Editor({
            //  view: view
            //});
            // Add widget to top-right of the view
            //view.ui.add(editor, "top-right");

            watchUtils.whenFalseOnce(view, "updating", function() {
                document.getElementsByTagName("canvas")[0].style.filter = "opacity(1)";
                document.getElementById("loader").style.display = "none";
            });
          });
        });

      const pointsOfInterestLayer = new FeatureLayer({
        url: "https://services1.arcgis.com/UwIZajkvy9eyvgek/arcgis/rest/services/points_of_interest_mt_hood/FeatureServer",
        screenSizePerspectiveEnabled: false,
        renderer: renderers.getPOIRenderer(),
        labelingInfo: renderers.getPOILabeling()
      });

      map.add(pointsOfInterestLayer);

      const skiTrailsLayer = new FeatureLayer({
        url: "https://services1.arcgis.com/UwIZajkvy9eyvgek/arcgis/rest/services/ski_trails_mt_hood/FeatureServer",
        elevationInfo: {
          mode: "relative-to-scene",
          offset: 5
        },
        renderer: renderers.getSkiTrailsRenderer()
      });
      map.add(skiTrailsLayer);

      const roadsLayer = new FeatureLayer({
        url: "https://services1.arcgis.com/UwIZajkvy9eyvgek/arcgis/rest/services/roads_mt_hood/FeatureServer",
        elevationInfo: {
          mode: "absolute-height",
          offset: 5
        },
        renderer: renderers.getRoadsRenderer()
      });
      map.add(roadsLayer);

      const modelsLayer = new FeatureLayer({
        url: "https://services1.arcgis.com/UwIZajkvy9eyvgek/ArcGIS/rest/services/3d_models_mt_hood/FeatureServer",
        renderer: renderers.getModelsRenderer()
      });

      map.add(modelsLayer);

    }
  }
})
