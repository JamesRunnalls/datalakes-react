import L from "leaflet";
import * as d3 from "d3";
import "d3-contour";

L.Contour = L.GeoJSON.extend({
  options: {
    thresholds: 50,
    color: 1,
    translate: false,
  },

  initialize: function (data, options) {
    L.setOptions(this, options);
    this._layers = {};

    if (data) {
      var geojson = this._createContours(data);
      this.addData(geojson);
    }
  },
  _createContours: function (data) {
    var zdomain = d3.extent(
      [].concat.apply([], data.z).filter((f) => {
        return !isNaN(parseFloat(f)) && isFinite(f);
      })
    );
    var thresholds = d3.range(
      zdomain[0],
      zdomain[1],
      (zdomain[1] - zdomain[0]) / this.options.thresholds
    );

    var values = data.z.flat();
    var contours = d3
      .contours()
      .size([data.z[0].length, data.z.length])
      .thresholds(thresholds)(values);

    if (typeof this.options.translate === "function") {
      for (var i = 0; i < contours.length; i++) {
        for (var j = 0; j < contours[i].coordinates.length; j++) {
          for (var k = 0; k < contours[i].coordinates[j].length; k++) {
            for (var l = 0; l < contours[i].coordinates[j][k].length; l++) {
              contours[i].coordinates[j][k][l] = this.options.translate(
                data.x,
                data.y,
                contours[i].coordinates[j][k][l][1],
                contours[i].coordinates[j][k][l][0]
              );
            }
          }
        }
      }
    }
    return contours;
  },
});

L.contour = function (inputdata, options) {
  return new L.Contour(inputdata, options);
};
