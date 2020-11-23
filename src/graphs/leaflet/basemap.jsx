import React, { Component } from "react";
import L from "leaflet";
import * as d3 from "d3";
import "leaflet-draw";
import "./leaflet_vectorField";
import "./leaflet_vectorFieldAnim";
import "./leaflet_customcontrol";
import "./leaflet_colorpicker";
import { getColor } from "../../components/gradients/gradients";
import "./css/leaflet.css";

class Basemap extends Component {
  isInt = (value) => {
    if (/^[-+]?(\d+|Infinity)$/.test(value)) {
      return true;
    } else {
      return false;
    }
  };

  zoomIn = () => {
    this.map.setZoom(this.map.getZoom() + 1);
  };

  zoomOut = () => {
    this.map.setZoom(this.map.getZoom() - 1);
  };

  hoverOver = (e) => {
    this.props.hoverFunc(e.target, "over");
  };

  hoverOut = (e) => {
    this.props.hoverFunc(e.target, "out");
  };

  CHtoWGSlatlng = (yx) => {
    var y_aux = (yx[0] - 600000) / 1000000;
    var x_aux = (yx[1] - 200000) / 1000000;
    var lat =
      16.9023892 +
      3.238272 * x_aux -
      0.270978 * Math.pow(y_aux, 2) -
      0.002528 * Math.pow(x_aux, 2) -
      0.0447 * Math.pow(y_aux, 2) * x_aux -
      0.014 * Math.pow(x_aux, 3);
    var lng =
      2.6779094 +
      4.728982 * y_aux +
      0.791484 * y_aux * x_aux +
      0.1306 * y_aux * Math.pow(x_aux, 2) -
      0.0436 * Math.pow(y_aux, 3);
    lat = (lat * 100) / 36;
    lng = (lng * 100) / 36;

    return [lat, lng];
  };

  meteoSwissMarkers = async (layer, file) => {
    function getValueFromID(id, data) {
      var index = data.findIndex((d) => d.id === id);
      return data[index].v;
    }
    function getDirFromID(id, data) {
      var index = data.findIndex((d) => d.id === id);
      return data[index].d;
    }
    var { datetime, templates } = this.props;
    var {
      markerLabel,
      markerSymbol,
      markerFixedSize,
      markerSize,
      min,
      max,
      unit,
      colors,
      data,
    } = layer;
    var arr = file.filelink.split("/");
    var source = arr[arr.length - 3];
    var parameter = arr[arr.length - 2];

    // Merge template and data
    var template = JSON.parse(JSON.stringify(templates[source][parameter]));
    var inputData = JSON.parse(JSON.stringify(data));
    var ids = inputData.map((fd) => fd.id);
    var layerData = template.features;
    layerData = layerData.filter((t) => ids.includes(t.id));
    for (var i = 0; i < layerData.length; i++) {
      layerData[i].properties.value = getValueFromID(
        layerData[i].id,
        inputData
      );
      if (parameter === "wind") {
        layerData[i].properties.wind_direction_radian = getDirFromID(
          layerData[i].id,
          inputData
        );
      }
    }

    var coeff = 1000 * 60 * 10;
    datetime = new Date(Math.round(datetime.getTime() / coeff) * coeff);

    var minSize = 5;
    var maxSize = 30;
    var markerGroup = L.layerGroup().addTo(this.map);

    var marker, value, color, size, latlng, valuestring;
    var rotation = 0;
    for (var j = 0; j < layerData.length; j++) {
      value = layerData[j].properties.value;
      valuestring = String(value) + String(unit);
      color = getColor(value, min, max, colors);
      if (markerFixedSize) {
        size = markerSize;
      } else {
        size = ((value - min) / (max - min)) * (maxSize - minSize) + minSize;
      }
      if ("wind_direction_radian" in layerData[j].properties)
        rotation = layerData[j].properties.wind_direction_radian + Math.PI;
      latlng = this.CHtoWGSlatlng(layerData[j].geometry.coordinates);
      marker = new L.marker(latlng, {
        icon: L.divIcon({
          className: "map-marker",
          html:
            `<div style="padding:10px;transform:translate(-12px, -12px);position: absolute;">` +
            `<div class="${markerSymbol}" style="background-color:${color};height:${size}px;width:${size}px;transform: rotate(${rotation}rad)">` +
            `</div></div> `,
        }),
      })
        .bindTooltip(valuestring, {
          permanent: markerLabel,
          direction: "top",
        })
        .addTo(markerGroup);
      marker.bindPopup(
        "<table><tbody>" +
          '<tr><td colSpan="2"><strong>' +
          layer.title +
          "</strong></td></tr>" +
          "<tr><td class='text-nowrap'><strong>Station</strong></td><td>" +
          layerData[j].properties.station_name +
          "</td></tr>" +
          "<tr><td class='text-nowrap'><strong>Station Altitude</strong></td><td>" +
          layerData[j].properties.altitude +
          "</td></tr>" +
          "<tr><td class='text-nowrap'><strong>Data Owner</strong></td><td>MeteoSwiss</td></tr>" +
          "<tr><td class='text-nowrap'><strong>Datetime</strong></td><td>" +
          datetime.toLocaleString() +
          "</td></tr>" +
          "<tr><td><strong>Value at point:</strong></td><td>" +
          String(value) +
          String(unit) +
          '</td></tr><tr><td class=\'text-nowrap\'><strong>Link</strong></td><td><a target="_blank" href="' +
          layerData[j].properties.link +
          '">More information</a></td></tr>' +
          "</td></tr>" +
          "</tbody></table>"
      );
    }
    this.marker.push(markerGroup);
  };

  foenMarkers = async (layer, file) => {
    function getValueFromID(id, data) {
      var index = data.findIndex((d) => d.id === id);
      return data[index].v;
    }
    var {
      markerLabel,
      markerSymbol,
      markerFixedSize,
      markerSize,
      min,
      max,
      unit,
      colors,
      data,
    } = layer;
    var { datetime, templates } = this.props;
    var arr = file.filelink.split("/");
    var source = arr[arr.length - 3];
    var parameter = arr[arr.length - 2];

    var coeff = 1000 * 60 * 10;
    datetime = new Date(Math.round(datetime.getTime() / coeff) * coeff);

    // Merge template and data
    var template = JSON.parse(JSON.stringify(templates[source][parameter]));
    var inputData = JSON.parse(JSON.stringify(data));
    var ids = inputData.map((fd) => fd.id);
    var layerData = template.features;
    layerData = layerData.filter((t) => ids.includes(t.id));
    for (var i = 0; i < layerData.length; i++) {
      layerData[i].properties.value = getValueFromID(
        layerData[i].id,
        inputData
      );
    }

    var minSize = 5;
    var maxSize = 30;
    var markerGroup = L.layerGroup().addTo(this.map);

    var marker, value, color, size, latlng, valuestring;
    var rotation = 0;
    for (var j = 0; j < layerData.length; j++) {
      value = layerData[j].properties.value;
      valuestring = String(value) + String(unit);
      color = getColor(value, min, max, colors);
      if (markerFixedSize) {
        size = markerSize;
      } else {
        size = ((value - min) / (max - min)) * (maxSize - minSize) + minSize;
      }
      latlng = this.CHtoWGSlatlng(layerData[j].geometry.coordinates);
      marker = new L.marker(latlng, {
        icon: L.divIcon({
          className: "map-marker",
          html:
            `<div style="padding:10px;transform:translate(-12px, -12px);position: absolute;">` +
            `<div class="${markerSymbol}" style="background-color:${color};height:${size}px;width:${size}px;transform: rotate(${rotation}deg)">` +
            `</div></div> `,
        }),
      })
        .bindTooltip(valuestring, {
          permanent: markerLabel,
          direction: "top",
        })
        .addTo(markerGroup);
      marker.bindPopup(
        "<table><tbody>" +
          '<tr><td colSpan="2"><strong>' +
          layer.title +
          "</strong></td></tr>" +
          "<tr><td class='text-nowrap'><strong>Station</strong></td><td>" +
          layerData[j].properties.name +
          "</td></tr>" +
          "<tr><td class='text-nowrap'><strong>Station Type</strong></td><td>" +
          layerData[j].properties["w-typ"] +
          "</td></tr>" +
          "<tr><td class='text-nowrap'><strong>Data Owner</strong></td><td>FOEN</td></tr>" +
          "<tr><td class='text-nowrap'><strong>Datetime</strong></td><td>" +
          datetime.toLocaleString() +
          "</td></tr>" +
          "<tr><td><strong>Value at point:</strong></td><td>" +
          String(value) +
          String(unit) +
          "</td></tr><tr><td class='text-nowrap'><strong>Link</strong></td><td>" +
          layerData[j].properties.description +
          "</td></tr>" +
          "</tbody></table>"
      );
    }
    this.marker.push(markerGroup);
  };

  movingAverage = (data, size) => {
    function pointsInRadius(quadtree, x, y, radius) {
      const result = [];
      var filter;
      const radius2 = radius * radius;
      const accept = filter
        ? (d) => filter(d) && result.push(d)
        : (d) => result.push(d);
      quadtree.visit(function (node, x1, y1, x2, y2) {
        if (node.length) {
          return (
            x1 >= x + radius ||
            y1 >= y + radius ||
            x2 < x - radius ||
            y2 < y - radius
          );
        }
        const dx = +quadtree._x.call(null, node.data) - x,
          dy = +quadtree._y.call(null, node.data) - y;
        if (dx * dx + dy * dy < radius2) {
          do {
            accept(node.data);
          } while ((node = node.next));
        }
      });
      return result;
    }

    function medianofpoints(points) {
      var arr = points.map((p) => p[2]);
      arr.sort(function (a, b) {
        return a - b;
      });
      var half = Math.floor(arr.length / 2);
      if (arr.length % 2) return arr[half];
      return (arr[half - 1] + arr[half]) / 2.0;
    }

    var { lon, lat, lonres, latres, v } = data;
    var radius = Math.max(lonres, latres) * size;
    var outdata = JSON.parse(JSON.stringify(v));

    let quadtreedata = [];
    for (var j = 0; j < v.length; j++) {
      quadtreedata.push([lat[j], lon[j], v[j]]);
    }

    let min_x = Math.min(...lat);
    let min_y = Math.min(...lon);
    let max_x = Math.max(...lat);
    let max_y = Math.max(...lon);

    let quadtree = d3
      .quadtree()
      .extent([
        [min_x, min_y],
        [max_x, max_y],
      ])
      .addAll(quadtreedata);

    for (var i = 0; i < outdata.length; i++) {
      outdata[i] = medianofpoints(
        pointsInRadius(quadtree, lat[i], lon[i], radius)
      );
    }

    return outdata;
  };

  remoteSensing = async (layer, file) => {
    var { mindatetime } = file;
    var {
      min,
      max,
      unit,
      data,
      movingAverage,
      validpixelexpression,
      colors,
      title,
      datasourcelink,
    } = layer;
    data = JSON.parse(JSON.stringify(data));
    if ("vp" in data && validpixelexpression) {
      for (let i = data.vp.length - 1; i >= 0; i--) {
        if (data.vp[i] === 1) {
          data.v.splice(i, 1);
          data.lon.splice(i, 1);
          data.lat.splice(i, 1);
        }
      }
    }
    var polygons = [];
    var coords;
    var x = data.lonres / 2;
    var y = data.latres / 2;
    var plotdata;
    if (this.isInt(movingAverage)) {
      plotdata = this.movingAverage(data, movingAverage);
    } else {
      plotdata = data.v;
    }
    for (let i = 0; i < data.lon.length; i++) {
      coords = [
        [data.lat[i] - y, data.lon[i] - x],
        [data.lat[i] + y, data.lon[i] - x],
        [data.lat[i] + y, data.lon[i] + x],
        [data.lat[i] - y, data.lon[i] + x],
      ];
      var value = Math.round(plotdata[i] * 1000) / 1000;
      var valuestring = String(value) + String(unit);
      var pixelcolor = getColor(plotdata[i], min, max, colors);
      var satellite = "Sentinel 3";
      if ("satellite" in data) {
        satellite = data.satellite;
      }
      var vpe = "";
      if ("vpe" in data) {
        vpe =
          '<tr><td class="text-nowrap"><strong>Valid Pixel Expression</strong></td><td style="word-break:break-word;">' +
          data.vpe +
          "</td></tr>";
      }
      var datestring =
        new Date(mindatetime).toLocaleTimeString() +
        " " +
        new Date(mindatetime).toLocaleDateString();
      polygons.push(
        L.polygon(coords, {
          color: pixelcolor,
          fillColor: pixelcolor,
          fillOpacity: 1,
          title: valuestring,
        })
          .bindPopup(
            "<table><tbody>" +
              '<tr><td colSpan="2"><strong>' +
              title +
              "</strong></td></tr>" +
              "<tr><td class='text-nowrap'><strong>Satellite</strong></td><td>" +
              satellite +
              "</td></tr>" +
              "<tr><td class='text-nowrap'><strong>Datetime</strong></td><td>" +
              datestring +
              "</td></tr>" +
              "<tr><td class='text-nowrap'><strong>LatLng</strong></td><td>" +
              data.lat[i] +
              "," +
              data.lon[i] +
              "</td></tr>" +
              "<tr><td><strong>Value at point:</strong></td><td>" +
              String(value) +
              String(unit) +
              "</td></tr>" +
              vpe +
              '<tr><td class=\'text-nowrap\'><strong>Link</strong></td><td><a target="_blank" href="' +
              datasourcelink +
              '">More information</a></td></tr>' +
              "</tbody></table>"
          )
          .bindTooltip(valuestring, {
            permanent: false,
            direction: "top",
          })
      );
    }
    this.raster.push(L.layerGroup(polygons).addTo(this.map));
  };

  simstrat = async (layer, file) => {
    var { maxdatetime } = file;
    var { min, max, data } = layer;
    var layerData = JSON.parse(JSON.stringify(data));
    var polygons = [];
    for (var i = 0; i < layerData.length; i++) {
      var pixelcolor = getColor(layerData[i].value, min, max, layer.colors);
      var valuestring = String(layerData[i].value) + "°C";
      polygons.push(
        L.polygon(layerData[i].latlng, {
          color: pixelcolor,
          fillColor: pixelcolor,
          fillOpacity: 0.8,
          title: layerData[i].value,
        })
          .bindPopup(
            "<table><tbody>" +
              '<tr><td colSpan="2"><strong>' +
              layer.title +
              "</strong></td></tr>" +
              "<tr><td class='text-nowrap'><strong>Lake name</strong></td><td>" +
              layerData[i].name +
              "</td></tr>" +
              "<tr><td class='text-nowrap'><strong>Lake Model</strong></td><td>Simstrat 1D Model</td></tr>" +
              "<tr><td class='text-nowrap'><strong>Data Owner</strong></td><td>Eawag</td></tr>" +
              "<tr><td><strong>Datetime</strong></td><td>" +
              maxdatetime.toLocaleString() +
              "</td></tr>" +
              "<tr><td><strong>Surface water temperature</strong></td><td>" +
              layerData[i].value +
              "°C</td></tr>" +
              "<tr><td class='text-nowrap'><strong>Elevation</strong></td><td>" +
              layerData[i].elevation +
              "m</td></tr>" +
              "<tr><td class='text-nowrap'><strong>Depth</strong></td><td>" +
              layerData[i].depth +
              " m</td></tr>" +
              '<tr><td class=\'text-nowrap\'><strong>Link</strong></td><td><a target="_blank" href="' +
              layerData[i].link +
              '">Information about this lake model</a></td></tr>' +
              "</tbody></table>"
          )
          .bindTooltip(valuestring, {
            permanent: false,
            direction: "top",
          })
      );
    }
    this.raster.push(L.layerGroup(polygons).addTo(this.map));
  };

  matlabToJavascriptDatetime = (date) => {
    return new Date((date - 719529) * 24 * 60 * 60 * 1000);
  };

  getCellCorners = (data, i, j, locationformat) => {
    function cellCorner(center, opposite, left, right, data, i, j) {
      if (center === null) {
        return false;
      } else if (opposite !== null && left !== null && right !== null) {
        // All corner points
        var m1 = (center[1] - opposite[1]) / (center[0] - opposite[0]);
        var m2 = (left[1] - right[1]) / (left[0] - right[0]);
        var c1 = opposite[1] - m1 * opposite[0];
        var c2 = right[1] - m2 * right[0];
        let x = (c2 - c1) / (m1 - m2);
        let y = m1 * x + c1;
        return [x, y];
      } else if (opposite !== null) {
        let x = center[0] + (opposite[0] - center[0]) / 2;
        let y = center[1] + (opposite[1] - center[1]) / 2;
        return [x, y];
      } else if (left !== null && right !== null) {
        let x = left[0] + (right[0] - left[0]) / 2;
        let y = left[1] + (right[1] - left[1]) / 2;
        return [x, y];
      } else if (right !== null) {
        let x =
          center[0] + (right[0] - center[0]) / 2 + (right[1] - center[1]) / 2;
        let y =
          center[1] + (right[1] - center[1]) / 2 - (right[0] - center[0]) / 2;
        return [x, y];
      } else if (left !== null) {
        let x =
          center[0] + (left[0] - center[0]) / 2 - (left[1] - center[1]) / 2;
        let y =
          center[1] + (left[1] - center[1]) / 2 + (left[0] - center[0]) / 2;
        return [x, y];
      } else {
        return false;
      }
    }

    function oppositePoint(center, corner) {
      let x = center[0] + center[0] - corner[0];
      let y = center[1] + center[1] - corner[1];
      return [x, y];
    }
    // TopLeft
    var tl = cellCorner(
      data[i][j],
      data[i - 1][j - 1],
      data[i][j - 1],
      data[i - 1][j],
      data,
      i,
      j
    );
    // BottomLeft
    var bl = cellCorner(
      data[i][j],
      data[i + 1][j - 1],
      data[i + 1][j],
      data[i][j - 1],
      data,
      i,
      j
    );
    // BottomRight
    var br = cellCorner(
      data[i][j],
      data[i + 1][j + 1],
      data[i][j + 1],
      data[i + 1][j],
      data,
      i,
      j
    );
    // TopRight
    var tr = cellCorner(
      data[i][j],
      data[i - 1][j + 1],
      data[i - 1][j],
      data[i][j + 1],
      data,
      i,
      j
    );

    if (!tl && br) tl = oppositePoint(data[i][j], br);
    if (!bl && tr) bl = oppositePoint(data[i][j], tr);
    if (!br && tl) br = oppositePoint(data[i][j], tl);
    if (!tr && bl) tr = oppositePoint(data[i][j], bl);
    if (tl && bl && br && tr) {
      if (locationformat === "CH1903") {
        return [
          this.CHtoWGSlatlng(tl),
          this.CHtoWGSlatlng(bl),
          this.CHtoWGSlatlng(br),
          this.CHtoWGSlatlng(tr),
        ];
      } else {
        return [tl, bl, br, tr];
      }
    } else {
      return false;
    }
  };

  threeDmodel = async (layer, file, timeformat, locationformat) => {
    var { parameters_id, data: indata, id } = layer;
    var { datetime, depth, data } = indata;

    if (timeformat === "matlab") {
      datetime = this.matlabToJavascriptDatetime(datetime);
    } else if (timeformat === "unix") {
      datetime = new Date(datetime * 1000);
    }

    depth = Math.abs(depth).toFixed(2);
    var {
      vectorArrows,
      vectorMagnitude,
      vectorFlow,
      vectorFlowColor,
      vectorArrowColor,
      min,
      max,
      colors,
      unit,
      title,
      datasets_id,
      opacity,
      datasource,
    } = layer;
    var polygons, i, j, coords, value, valuestring, pixelcolor;
    var map = this.map;
    if (parameters_id === 5) {
      polygons = [];
      for (i = 1; i < data.length - 1; i++) {
        for (j = 1; j < data[i].length - 1; j++) {
          if (data[i][j] !== null) {
            coords = this.getCellCorners(data, i, j, locationformat);
            if (coords) {
              value = Math.round(data[i][j][2] * 1000) / 1000;
              valuestring = String(value) + String(unit);
              pixelcolor = getColor(data[i][j][2], min, max, colors);
              polygons.push(
                L.polygon(coords, {
                  color: pixelcolor,
                  fillColor: pixelcolor,
                  fillOpacity: 1,
                  title: data[i][j][2],
                })
                  .bindPopup(
                    "<table><tbody>" +
                      '<tr><td colSpan="2"><strong>' +
                      layer.title +
                      "</strong></td></tr>" +
                      "<tr><td class='text-nowrap'><strong>Lake Model</strong></td><td>" +
                      datasource +
                      "</td></tr>" +
                      "<tr><td class='text-nowrap'><strong>Data Owner</strong></td><td>Eawag</td></tr>" +
                      "<tr><td><strong>Datetime:</strong></td><td>" +
                      datetime.toLocaleString() +
                      "</td></tr>" +
                      "<tr><td><strong>Depth:</strong></td><td>" +
                      depth +
                      "m</td></tr>" +
                      "<tr><td><strong>Value at point:</strong></td><td>" +
                      data[i][j][2] +
                      unit +
                      `</td></tr><tr><td class='text-nowrap'><strong>Link</strong></td><td><a target="_blank" href="/datadetail/${datasets_id}"` +
                      '">More information</a></td></tr>' +
                      "</tbody></table>"
                  )
                  .bindTooltip(valuestring, {
                    permanent: false,
                    direction: "top",
                  })
              );
            }
          }
        }
      }
      this.raster.push(L.featureGroup(polygons).addTo(this.map));
      if (
        !("center" in this.props) &&
        !("zoom" in this.props) &&
        !this.zoomedtolayer
      ) {
        this.map.fitBounds(this.raster[0].getBounds());
        this.zoomedtolayer = true;
      }
    } else if (parameters_id === 25) {
      if (vectorMagnitude) {
        polygons = [];
        for (i = 0; i < data.length - 1; i++) {
          for (j = 0; j < data[i].length - 1; j++) {
            if (data[i][j] !== null) {
              coords = this.getCellCorners(data, i, j, locationformat);
              if (coords) {
                var magnitude = Math.abs(
                  Math.sqrt(
                    Math.pow(data[i][j][3], 2) + Math.pow(data[i][j][4], 2)
                  )
                );
                value = Math.round(magnitude * 1000) / 1000;
                valuestring = String(value) + String(unit);
                pixelcolor = getColor(magnitude, min, max, colors);
                polygons.push(
                  L.polygon(coords, {
                    color: pixelcolor,
                    fillColor: pixelcolor,
                    fillOpacity: 1,
                    title: magnitude,
                  })
                    .bindPopup(
                      "<table><tbody>" +
                        '<tr><td colSpan="2"><strong>' +
                        title +
                        "</strong></td></tr>" +
                        "</td></tr>" +
                        "<tr><td class='text-nowrap'><strong>Lake Model</strong></td><td>" +
                        datasource +
                        "</td></tr>" +
                        "<tr><td class='text-nowrap'><strong>Data Owner</strong></td><td>Eawag</td></tr>" +
                        "<tr><td><strong>Datetime:</strong></td><td>" +
                        datetime.toLocaleString() +
                        "</td></tr>" +
                        "<tr><td><strong>Depth:</strong></td><td>" +
                        depth +
                        "m</td></tr>" +
                        "<tr><td><strong>Northern Water Velocity:</strong></td><td>" +
                        data[i][j][2] +
                        unit +
                        "<tr><td><strong>Eastern Water Velocity:</strong></td><td>" +
                        data[i][j][3] +
                        unit +
                        "<tr><td><strong>Magnitude Water Velocity:</strong></td><td>" +
                        valuestring +
                        `</td></tr><tr><td class='text-nowrap'><strong>Link</strong></td><td><a target="_blank" href="/datadetail/${datasets_id}"` +
                        '">More information</a></td></tr>' +
                        "</tbody></table>"
                    )
                    .bindTooltip(valuestring, {
                      permanent: false,
                      direction: "top",
                    })
                );
              }
            }
          }
        }
        this.raster.push(L.layerGroup(polygons).addTo(this.map));
      }

      if (vectorArrows) {
        var arrows = L.vectorField(data, {
          vectorArrowColor,
          colors,
          min,
          max,
          size: 15,
        }).addTo(this.map);
        var arrowtooltip = arrows.bindTooltip("my tooltip text", {
          permanent: false,
          direction: "top",
        });
        arrows.on("mousemove", function (e) {
          let { u, v } = e.value;
          if (u && v) {
            let mag = Math.round(Math.sqrt(u ** 2 + v ** 2) * 1000) / 1000;
            let deg = Math.round(
              (Math.atan2(u / mag, v / mag) * 180) / Math.PI
            );
            if (deg < 0) deg = 360 + deg;
            let html = `${mag}m/s ${deg}°`;
            arrowtooltip._tooltip._content = html;
            arrowtooltip.openTooltip(e.latlng);
          } else {
            arrowtooltip.closeTooltip();
          }
        });
        arrows.on("click", function (e) {
          if (e.value !== null && e.value.u !== null) {
            let { u, v } = e.value;
            let { lat, lng } = e.latlng;
            lat = Math.round(lat * 1000) / 1000;
            lng = Math.round(lng * 1000) / 1000;
            let mag = Math.round(Math.sqrt(u ** 2 + v ** 2) * 1000) / 1000;
            let deg = Math.round(
              (Math.atan2(u / mag, v / mag) * 180) / Math.PI
            );
            if (deg < 0) deg = 360 + deg;
            let html =
              "<table><tbody>" +
              '<tr><td colSpan="2"><strong>' +
              layer.title +
              "</strong></td></tr>" +
              "<tr><td class='text-nowrap'><strong>Lake Model</strong></td><td>" +
              datasource +
              "</td></tr>" +
              "<tr><td class='text-nowrap'><strong>Data Owner</strong></td><td>Eawag</td></tr>" +
              "<tr><td><strong>Datetime:</strong></td><td>" +
              datetime.toLocaleString() +
              "</td></tr>" +
              "<tr><td><strong>Depth:</strong></td><td>" +
              depth +
              "m</td></tr>" +
              `<tr><td><strong>Eastern Velocity:</strong></td><td>${u}${unit}</td></tr>` +
              `<tr><td><strong>Northern Velocity:</strong></td><td>${v}${unit}</td></tr>` +
              `<tr><td><strong>Magnitude:</strong></td><td>${mag}${unit}</td></tr>` +
              `<tr><td><strong>Direction:</strong></td><td>${deg}°</td></tr>` +
              `<tr><td><strong>LatLng:</strong></td><td>${lat},${lng}</td></tr>` +
              `</td></tr><tr><td class='text-nowrap'><strong>Link</strong></td><td><a target="_blank" href="/datadetail/${datasets_id}"` +
              ">More information</a></td></tr>" +
              "</tbody></table>";
            L.popup().setLatLng(e.latlng).setContent(html).openOn(map);
          }
        });
        this.raster.push(arrows);
      }

      if (vectorFlow) {
        var radius = 150;
        if (datasets_id === 14) {
          radius = 300;
        } else if (datasets_id === 17) {
          radius = 1000;
        }
        var vectordata = this.parseVectorData(data, radius);

        var vectors;
        if (Object.keys(this.vectorfieldanim).includes(id)) {
          this.vectorfieldanim[id].updateInputdata(vectordata);
          this.vectorfieldtime = this.props.datetime;
          vectors = this.vectorfieldanim[id];
        } else {
          function getLineColor(val) {
            return getColor(val, min, max, colors);
          }
          var color = "white";
          if (vectorFlowColor === "true") {
            color = getLineColor;
          } else if (["white", "grey", "black"].includes(vectorFlowColor)) {
            color = vectorFlowColor;
          }
          vectors = L.vectorFieldAnim(vectordata, {
            paths: 5000,
            color,
            opacity,
          }).addTo(this.map);
          this.vectorfieldtime = this.props.datetime;
          this.vectorfieldanim[id] = vectors;
        }

        try {
          this.flowtooltip.closeTooltip();
        } catch (e) {}

        this.flowtooltip = vectors.bindTooltip("", {
          permanent: false,
          direction: "top",
        });
        var flowtooltip = this.flowtooltip;
        vectors.on("mousemove", function (e) {
          let { u, v } = e.value;
          if (u && v) {
            let mag = Math.round(Math.sqrt(u ** 2 + v ** 2) * 1000) / 1000;
            let deg = Math.round(
              (Math.atan2(u / mag, v / mag) * 180) / Math.PI
            );
            if (deg < 0) deg = 360 + deg;
            let html = `${mag}m/s ${deg}°`;
            flowtooltip._tooltip._content = html;
            flowtooltip.openTooltip(e.latlng);
          } else {
            flowtooltip.closeTooltip();
          }
        });
        vectors.on("click", function (e) {
          if (e.value !== null && e.value.u !== null) {
            let { u, v } = e.value;
            let { lat, lng } = e.latlng;
            lat = Math.round(lat * 1000) / 1000;
            lng = Math.round(lng * 1000) / 1000;
            let mag = Math.round(Math.sqrt(u ** 2 + v ** 2) * 1000) / 1000;
            let deg = Math.round(
              (Math.atan2(u / mag, v / mag) * 180) / Math.PI
            );
            if (deg < 0) deg = 360 + deg;
            let html =
              "<table><tbody>" +
              '<tr><td colSpan="2"><strong>' +
              layer.title +
              "</strong></td></tr>" +
              "<tr><td class='text-nowrap'><strong>Lake Model</strong></td><td>" +
              datasource +
              "</td></tr>" +
              "<tr><td class='text-nowrap'><strong>Data Owner</strong></td><td>Eawag</td></tr>" +
              "<tr><td><strong>Datetime:</strong></td><td>" +
              datetime.toLocaleString() +
              "</td></tr>" +
              "<tr><td><strong>Depth:</strong></td><td>" +
              depth +
              "m</td></tr>" +
              `<tr><td><strong>Eastern Velocity:</strong></td><td>${u}${unit}</td></tr>` +
              `<tr><td><strong>Northern Velocity:</strong></td><td>${v}${unit}</td></tr>` +
              `<tr><td><strong>Magnitude:</strong></td><td>${mag}${unit}</td></tr>` +
              `<tr><td><strong>Direction:</strong></td><td>${deg}°</td></tr>` +
              `<tr><td><strong>LatLng:</strong></td><td>${lat},${lng}</td></tr>` +
              `</td></tr><tr><td class='text-nowrap'><strong>Link</strong></td><td><a target="_blank" href="/datadetail/${datasets_id}"` +
              ">More information</a></td></tr>" +
              "</tbody></table>";
            L.popup().setLatLng(e.latlng).setContent(html).openOn(map);
          }
        });
      }
    }
  };

  capitalize = (s) => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  gitPlot = async (layer, file) => {
    var {
      datasetparameters,
      parameters_id,
      datasets_id,
      markerLabel,
      min,
      max,
      colors,
      markerSymbol,
      markerFixedSize,
      markerSize,
      latitude,
      longitude,
      unit,
      maxdepth,
      data,
      yselectindex,
    } = layer;
    var datasetparameter = datasetparameters.find(
      (dp) => dp.parameters_id === parameters_id
    );
    var { datetime, depth } = this.props;
    var type = datasetparameters.map((dp) => dp.axis + "&" + dp.parameters_id);
    var index, value, indexx, indexy;
    var size, marker, dt;
    var minSize = 5;
    var maxSize = 30;
    var markerGroup = L.layerGroup().addTo(this.map);
    var dd = "<tr><td><strong>Depth</strong></td><td>";

    if (type.includes("M&1") && type.includes("y&2")) {
      // Profiler
      var dp2 = datasetparameters.find((dp) => dp.parameters_id === 1);
      var dp3 = datasetparameters.find((dp) => dp.parameters_id === 2);
      index = this.indexClosest(depth, data.y);
      value = this.numberformat(parseFloat(data[datasetparameter.axis][index]));
      dt = new Date(data[dp2.axis][index] * 1000);
      dd = dd + data[dp3.axis][index];
    } else if (
      type.join(",").includes("z&") &&
      type.includes("x&1") &&
      type.includes("y&2")
    ) {
      // 2D Depth Time Dataset
      indexx = this.indexClosest(datetime.getTime() / 1000, data["x"]);
      indexy = this.indexClosest(depth, data["y"]);
      value = this.numberformat(data[datasetparameter.axis][indexy][indexx]);
      dt = new Date(data["x"][indexx] * 1000);
      dd = dd + data["y"][indexy];
    } else if (
      type.includes("x&1") &&
      type.includes("y&") &&
      !type.join(",").includes("z&")
    ) {
      // 1D Parameter Time Dataset
      index = this.indexClosest(datetime.getTime() / 1000, data["x"]);
      value = this.numberformat(data[datasetparameter.axis][index]);
      dt = new Date(data["x"][index] * 1000);
      dd = dd + maxdepth;
    } else if (
      type.includes("x&1") &&
      !type.includes("y&2") &&
      type.join(",").includes("z&")
    ) {
      // 2D Non-Depth Time Dataset
      var param = datasetparameters.find((dp) => dp.axis === "y");
      indexx = this.indexClosest(datetime.getTime() / 1000, data["x"]);
      if (yselectindex) {
        value = this.numberformat(
          data[datasetparameter.axis][yselectindex][indexx]
        );
        dt = new Date(data["x"][indexx] * 1000);
        dd = `<tr><td><strong>${this.capitalize(
          param.parseparameter
        )}</strong></td><td>${data["y"][yselectindex]} ${param.unit}`;
      } else {
        value = this.numberformat(data[datasetparameter.axis][0][indexx]);
        dt = new Date(data["x"][indexx] * 1000);
        dd = `<tr><td><strong>${this.capitalize(
          param.parseparameter
        )}</strong></td><td>${data["y"][0]} ${param.unit}`;
      }
    } else {
      alert("No plotting function defined");
    }

    var valuestring = String(value) + String(datasetparameter.unit);
    var color = getColor(value, min, max, colors);
    var shape = markerSymbol;
    if (markerFixedSize) {
      size = markerSize;
    } else {
      size = ((value - min) / (max - min)) * (maxSize - minSize) + minSize;
    }
    marker = new L.marker([latitude, longitude], {
      icon: L.divIcon({
        className: "map-marker",
        html:
          `<div style="padding:10px;transform:translate(-12px, -12px);position: absolute;">` +
          `<div class="${shape}" style="background-color:${color};height:${size}px;width:${size}px">` +
          `</div></div> `,
      }),
    })
      .bindTooltip(valuestring, {
        permanent: markerLabel,
        direction: "top",
      })
      .addTo(markerGroup);
    marker.bindPopup(
      "<table><tbody>" +
        '<tr><td colSpan="2"><strong>' +
        layer.title +
        "</strong></td></tr>" +
        "<tr><td class='text-nowrap'><strong>Datetime</strong></td><td>" +
        dt +
        "</td></tr>" +
        "<tr><td><strong>Value</strong></td><td>" +
        String(value) +
        String(unit) +
        "</td></tr>" +
        dd +
        "</td></tr>" +
        '<tr><td class=\'text-nowrap\'><strong>Link</strong></td><td><a target="_blank" href="/datadetail/' +
        datasets_id +
        '">More information</a></td></tr>' +
        "</tbody></table>"
    );

    this.marker.push(markerGroup);
  };

  parseVectorData = (data, radius) => {
    function createAndFillTwoDArray({ rows, columns, defaultValue }) {
      return Array.from({ length: rows }, () =>
        Array.from({ length: columns }, () => defaultValue)
      );
    }
    var nCols = 200;
    var nRows = 200;
    let flatdata = data.flat().filter((d) => d !== null);
    let quadtreedata = flatdata.map((f) => [f[0], f[1], f[3], f[4]]);

    let x_array = flatdata.map((df) => df[0]);
    let y_array = flatdata.map((df) => df[1]);

    let min_x = Math.min(...x_array);
    let min_y = Math.min(...y_array);
    let max_x = Math.max(...x_array);
    let max_y = Math.max(...y_array);

    let xSize = (max_x - min_x) / nCols;
    let ySize = (max_y - min_y) / nRows;

    let quadtree = d3
      .quadtree()
      .extent([
        [min_x, min_y],
        [max_x, max_y],
      ])
      .addAll(quadtreedata);

    var outdata = createAndFillTwoDArray({
      rows: nRows + 1,
      columns: nCols + 1,
      defaultValue: null,
    });
    var x, y;
    for (var i = 0; i < nRows + 1; i++) {
      y = max_y - i * ySize;
      for (var j = 0; j < nCols + 1; j++) {
        x = min_x + j * xSize;
        if (quadtree.find(x, y, radius) !== undefined) {
          outdata[i][j] = [
            JSON.stringify(quadtree.find(x, y, radius)[2]),
            JSON.stringify(quadtree.find(x, y, radius)[3]),
          ];
        }
      }
    }
    return {
      nCols,
      nRows,
      xSize,
      ySize,
      xllcorner: min_x,
      yllcorner: min_y,
      vectordata: outdata,
    };
  };

  numberformat = (num) => {
    num = parseFloat(num);
    if (num > 9999 || (num < 0.01 && num > -0.01) || num < -9999) {
      num = num.toExponential(3);
    } else {
      num = Math.round(num * 10000) / 10000;
    }
    return num;
  };

  indexClosest = (num, arr) => {
    var index = 0;
    var diff = Math.abs(num - arr[0]);
    for (var val = 0; val < arr.length; val++) {
      var newdiff = Math.abs(num - arr[val]);
      if (newdiff < diff) {
        diff = newdiff;
        index = val;
      }
    }
    return index;
  };

  addPoint = (e) => {
    this.map.removeLayer(this.point);
    var lat = Math.round(e.latlng.lat * 100) / 100;
    var lng = Math.round(e.latlng.lng * 100) / 100;
    this.point = new L.marker(e.latlng, {
      icon: L.divIcon({
        className: "map-marker",
        html:
          `<div style="padding:10px;transform:translate(-12px, -12px);position: absolute;">` +
          `<div class="pin2">` +
          `</div></div> `,
      }),
    })
      .bindTooltip(`(${lat},${lng})`, {
        direction: "top",
      })
      .addTo(this.map);
    this.props.updatePoint(e.latlng);
  };

  addLine = (e) => {
    if (Object.keys(this.line._layers).length > 1) {
      this.line.clearLayers();
      this.props.updateLine([]);
    }
    var lat = Math.round(e.latlng.lat * 100) / 100;
    var lng = Math.round(e.latlng.lng * 100) / 100;
    new L.marker(e.latlng, {
      icon: L.divIcon({
        className: "map-marker",
        html:
          `<div style="padding:10px;transform:translate(-12px, -12px);position: absolute;">` +
          `<div class="pin2">` +
          `</div></div> `,
      }),
    })
      .bindTooltip(`(${lat},${lng})`, {
        direction: "top",
      })
      .addTo(this.line);
    if (Object.keys(this.line._layers).length === 2) {
      var pointList = [];
      for (var key in this.line._layers) {
        pointList.push(this.line._layers[key]["_latlng"]);
      }
      new L.Polyline(pointList, {
        color: "red",
        weight: 2,
        smoothFactor: 1,
        dashArray: "20, 10",
        dashOffset: "0",
      }).addTo(this.line);
      this.props.updateLine(pointList);
    }
  };

  arraysEqual = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  findDataset = (fileid, files) => {
    return files.find((x) => x.id === fileid);
  };

  updatePlot = (prevProps) => {
    var { selectedlayers, datetime } = this.props;

    // Remove old layers
    this.marker.forEach((layer) => {
      this.map.removeLayer(layer);
    });
    this.raster.forEach((layer) => {
      this.map.removeLayer(layer);
    });
    this.raster.length = 0;

    if (this.vectorfieldtime === datetime) {
      Object.values(this.vectorfieldanim).forEach((layer) => {
        this.map.removeLayer(layer);
      });
      this.vectorfieldanim = {};
    }

    // Add new layers
    for (var i = selectedlayers.length - 1; i > -1; i--) {
      var layer = selectedlayers[i];
      if (layer.visible) {
        var { fileid, files, mapplotfunction } = layer;
        var file = this.findDataset(fileid, files);
        mapplotfunction === "gitPlot" && this.gitPlot(layer, file);
        mapplotfunction === "foenMarkers" && this.foenMarkers(layer, file);
        mapplotfunction === "meteoSwissMarkers" &&
          this.meteoSwissMarkers(layer, file);
        mapplotfunction === "remoteSensing" && this.remoteSensing(layer, file);
        mapplotfunction === "simstrat" && this.simstrat(layer, file);
        mapplotfunction === "meteolakes" &&
          this.threeDmodel(layer, file, "matlab", "CH1903");
        mapplotfunction === "datalakes" &&
          this.threeDmodel(layer, file, "unix", "CH1903");
      }
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.loading && !this.props.loading) {
      var updatePlot = this.updatePlot;
      window.setTimeout(() => {
        updatePlot(prevProps);
        if (prevProps.zoom !== this.props.zoom) {
          window.setTimeout(() => {
            this.map.flyTo(this.props.center, this.props.zoom, {
              animate: true,
              duration: 1,
            });
          }, 500);
        }
      }, 0);
    }

    if (prevProps.basemap !== this.props.basemap) {
      this.map.removeLayer(this.layer);
      this.layer = this.baseMaps[this.props.basemap];
      this.map.addLayer(this.layer);
    }
    if (prevProps.point !== this.props.point) {
      var { addPoint } = this;
      if (this.props.point) {
        this.map.on("click", addPoint);
        document.getElementsByClassName("leaflet-popup-pane")[0].style.display =
          "none";
        document.getElementsByClassName("leaflet-popup-pane")[0].innerHTML = "";
        L.DomUtil.addClass(this.map._container, "crosshair-cursor-enabled");
      } else {
        this.map.off("click", addPoint);
        this.map.removeLayer(this.point);
        this.props.updatePoint({});
        if (!this.props.point && !this.props.line) {
          document.getElementsByClassName(
            "leaflet-popup-pane"
          )[0].style.display = "block";
          L.DomUtil.removeClass(
            this.map._container,
            "crosshair-cursor-enabled"
          );
        }
      }
    }
    if (prevProps.line !== this.props.line) {
      var { addLine } = this;
      if (this.props.line) {
        this.map.on("click", addLine);
        document.getElementsByClassName("leaflet-popup-pane")[0].style.display =
          "none";
        document.getElementsByClassName("leaflet-popup-pane")[0].innerHTML = "";
        L.DomUtil.addClass(this.map._container, "crosshair-cursor-enabled");
      } else {
        this.map.off("click", addLine);
        this.line.clearLayers();
        this.props.updateLine([]);
        if (!this.props.point && !this.props.line) {
          document.getElementsByClassName(
            "leaflet-popup-pane"
          )[0].style.display = "block";
          L.DomUtil.removeClass(
            this.map._container,
            "crosshair-cursor-enabled"
          );
        }
      }
    }
    this.map.invalidateSize();
  }

  componentDidMount() {
    var center = [46.85, 7.55];
    if ("center" in this.props) {
      center = this.props.center;
    }
    var zoom = 8;
    if ("zoom" in this.props) {
      zoom = this.props.zoom;
    }

    var datalakesmap = L.tileLayer(
      "https://api.mapbox.com/styles/v1/jamesrunnalls/ck96x8fhp6h2i1ik5q9xz0iqn/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ",
      {
        attribution:
          'swisstopo DV 5704 000 000 | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://www.mapbox.com/">mapbox</a>',
      }
    );
    var datalakesmapgrey = L.tileLayer(
      "https://api.mapbox.com/styles/v1/jamesrunnalls/ckfs3ngtw0fx519o5oinhc5mh/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ",
      {
        attribution:
          'swisstopo DV 5704 000 000 | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://www.mapbox.com/">mapbox</a>',
      }
    );
    var swisstopo = L.tileLayer(
      "https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg",
      {
        attribution:
          '<a title="Swiss Federal Office of Topography" href="https://www.swisstopo.admin.ch/">swisstopo</a>',
      }
    );
    var satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      }
    );

    var dark = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }
    );

    var topolink =
      "https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ";

    this.baseMaps = {
      datalakesmap,
      datalakesmapgrey,
      swisstopo,
      satellite,
      dark,
    };

    this.layer = datalakesmap;
    if ("basemap" in this.props) {
      this.layer = this.baseMaps[this.props.basemap];
    }

    var zoomControl = true;
    var { setZoomIn, setZoomOut } = this.props;
    if (setZoomIn && setZoomOut) {
      setZoomIn(this.zoomIn);
      setZoomOut(this.zoomOut);
      zoomControl = false;
    }

    this.map = L.map("map", {
      preferCanvas: true,
      zoomControl,
      center: center,
      zoom: zoom,
      minZoom: 7,
      maxZoom: 15,
    });

    var colorpicker = L.tileLayer
      .colorPicker(topolink, {
        opacity: 0,
      })
      .addTo(this.map);

    this.layer.addTo(this.map);

    // Draw
    this.point = {};
    this.line = L.layerGroup().addTo(this.map);

    var map = this.map;
    var passLocation = this.props.passLocation;
    this.map.on("mousemove", function (e) {
      var lat = Math.round(1000 * e.latlng.lat) / 1000;
      var lng = Math.round(1000 * e.latlng.lng) / 1000;
      var a = colorpicker.getColor(e.latlng);
      var alt = NaN;
      if (a !== null) {
        alt =
          Math.round(
            10 * (-10000 + (a[0] * 256 * 256 + a[1] * 256 + a[2]) * 0.1)
          ) / 10;
      }
      map.attributionControl.setPrefix(
        "(" + lat + "," + lng + ") " + alt + "m"
      );
      if (passLocation) {
        passLocation({ lat, lng, alt });
      }
    });

    if ("updateLocation" in this.props) {
      var { updateLocation } = this.props;
      this.map.on("zoomend", function (e) {
        let zoom = e.target._zoom;
        let latlng = e.target._lastCenter;
        let lat = Math.round(latlng.lat * 1000) / 1000;
        let lng = Math.round(latlng.lng * 1000) / 1000;
        updateLocation(zoom, [lat, lng]);
      });
      this.map.on("dragend", function (e) {
        let zoom = e.target._zoom;
        let latlng = map.getCenter();
        let lat = Math.round(latlng.lat * 1000) / 1000;
        let lng = Math.round(latlng.lng * 1000) / 1000;
        updateLocation(zoom, [lat, lng]);
      });
    }

    this.marker = [];
    this.raster = [];
    this.vectorfieldanim = {};
    this.vectorfieldtime = this.props.datetime;
    this.zoomedtolayer = false;
  }

  render() {
    return (
      <React.Fragment>
        <div id="map"></div>
      </React.Fragment>
    );
  }
}

export default Basemap;
