import React, { Component } from "react";
import L from "leaflet";
import "./leaflet_vectorField";
import "./leaflet_customcontrol";
import "./leaflet_colorpicker";
import { getColor } from "../../components/gradients/gradients";
import Loading from "../../components/loading/loading";
import LayerGroups from "../../components/layergroups/layergroups";
import "./css/gis_map.css";
import "./css/leaflet.css";

class GISMap extends Component {
  state = {
    help: false,
    fullsize: false,
    loading: false,
    group: false,
    menu: false,
    initial: true,
  };

  zoomIn = () => {
    this.map.setZoom(this.map.getZoom() + 1);
  };

  zoomOut = () => {
    this.map.setZoom(this.map.getZoom() - 1);
  };

  toggleFullsize = () => {
    this.setState({ fullsize: !this.state.fullsize });
  };

  toggleHelp = () => {
    this.setState({ group: false, help: !this.state.help });
  };

  toggleMenu = () => {
    this.setState({ group: false, menu: !this.state.menu });
  };

  toggleGroup = () => {
    this.setState({ help: false, menu: false, group: !this.state.group });
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
    var { maxdatetime, maxdepth } = file;
    var { datetime, depth, templates } = this.props;
    var arr = file.filelink.split("/");
    var source = arr[arr.length - 3];
    var parameter = arr[arr.length - 2];

    // Merge template and data
    var template = JSON.parse(JSON.stringify(templates[source][parameter]));
    var inputData = JSON.parse(JSON.stringify(file.data));
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
    var {
      markerLabel,
      markerSymbol,
      markerFixedSize,
      markerSize,
      min,
      max,
      unit,
      colors,
    } = layer;
    var minSize = 5;
    var maxSize = 30;
    var markerGroup = L.layerGroup().addTo(this.map);

    var marker, value, color, size, latlng, valuestring;
    var rotation = 0;
    for (var j = 0; j < layerData.length; j++) {
      value = layerData[j].properties.value;
      var timediff = -Math.round(
        (datetime.getTime() / 1000 - new Date(maxdatetime).getTime() / 1000) /
          3600
      );
      var depthdiff = -Math.round((depth - maxdepth) * 100) / 100;
      valuestring =
        String(value) +
        String(unit) +
        '<br><div class="tooltipdiff">Diff: ' +
        (timediff > 0 ? "+" : "") +
        String(timediff) +
        "hrs " +
        (depthdiff > 0 ? " +" : " ") +
        String(depthdiff) +
        "m</div>";
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
          maxdatetime.toLocaleString() +
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
    var { maxdatetime, maxdepth } = file;
    var { datetime, depth, templates } = this.props;
    var arr = file.filelink.split("/");
    var source = arr[arr.length - 3];
    var parameter = arr[arr.length - 2];

    // Merge template and data
    var template = JSON.parse(JSON.stringify(templates[source][parameter]));
    var inputData = JSON.parse(JSON.stringify(file.data));
    var ids = inputData.map((fd) => fd.id);
    var layerData = template.features;
    layerData = layerData.filter((t) => ids.includes(t.id));
    for (var i = 0; i < layerData.length; i++) {
      layerData[i].properties.value = getValueFromID(
        layerData[i].id,
        inputData
      );
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
    } = layer;
    var minSize = 5;
    var maxSize = 30;
    var markerGroup = L.layerGroup().addTo(this.map);

    var marker, value, color, size, latlng, valuestring;
    var rotation = 0;
    for (var j = 0; j < layerData.length; j++) {
      value = layerData[j].properties.value;
      var timediff = -Math.round(
        (datetime.getTime() / 1000 - new Date(maxdatetime).getTime() / 1000) /
          3600
      );
      var depthdiff = -Math.round((depth - maxdepth) * 100) / 100;
      valuestring =
        String(value) +
        String(unit) +
        '<br><div class="tooltipdiff">Diff: ' +
        (timediff > 0 ? "+" : "") +
        String(timediff) +
        "hrs " +
        (depthdiff > 0 ? " +" : " ") +
        String(depthdiff) +
        "m</div>";
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
          maxdatetime.toLocaleString() +
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

  remoteSensing = async (layer, file) => {
    var { maxdatetime, maxdepth, data } = file;
    var { min, max, unit } = layer;
    var { datetime, depth } = this.props;
    var polygons = [];
    var coords;
    var x = data.lonres / 2;
    var y = data.latres / 2;
    for (var i = 0; i < data.lon.length; i++) {
      coords = [
        [data.lat[i] - y, data.lon[i] - x],
        [data.lat[i] + y, data.lon[i] - x],
        [data.lat[i] + y, data.lon[i] + x],
        [data.lat[i] - y, data.lon[i] + x],
      ];
      var value = Math.round(data.v[i] * 1000) / 1000;
      var timediff = -Math.round(
        (datetime.getTime() / 1000 - new Date(maxdatetime).getTime() / 1000) /
          3600
      );
      var depthdiff = -Math.round((depth - maxdepth) * 100) / 100;
      var valuestring =
        String(value) +
        String(unit) +
        '<br><div class="tooltipdiff">Diff: ' +
        (timediff > 0 ? "+" : "") +
        String(timediff) +
        "hrs " +
        (depthdiff > 0 ? " +" : " ") +
        String(depthdiff) +
        "m</div>";
      var pixelcolor = getColor(data.v[i], min, max, layer.colors);
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
              layer.title +
              "</strong></td></tr>" +
              "<tr><td class='text-nowrap'><strong>Satellite</strong></td><td>Sentinal 3</td></tr>" +
              "<tr><td class='text-nowrap'><strong>Data Owner</strong></td><td>Eawag</td></tr>" +
              "<tr><td class='text-nowrap'><strong>Datetime</strong></td><td>" +
              maxdatetime.toLocaleString() +
              "</td></tr>" +
              "<tr><td class='text-nowrap'><strong>LatLng</strong></td><td>" +
              data.lat[i] +
              "," +
              data.lon[i] +
              "</td></tr>" +
              "<tr><td><strong>Value at point:</strong></td><td>" +
              String(value) +
              String(unit) +
              '</td></tr><tr><td class=\'text-nowrap\'><strong>Link</strong></td><td><a target="_blank" href="' +
              layer.datasourcelink +
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
    var { maxdatetime, data } = file;
    var layerData = JSON.parse(JSON.stringify(data));
    var { min, max } = layer;
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

  meteolakesScalar = async (layer, file) => {
    var { maxdatetime, maxdepth, data } = file;
    var { min, max, colors, unit } = layer;
    var { depth, datetime } = this.props;
    var polygons = [];
    var matrix = data;
    for (var i = 0; i < matrix.length - 1; i++) {
      var row = matrix[i];
      var nextRow = matrix[i + 1];
      for (var j = 0; j < row.length - 1; j++) {
        if (
          row[j] === null ||
          nextRow[j] === null ||
          row[j + 1] === null ||
          nextRow[j + 1] === null
        ) {
        } else {
          var coords = [
            this.CHtoWGSlatlng([row[j][0], [row[j][1]]]),
            this.CHtoWGSlatlng([nextRow[j][0], [nextRow[j][1]]]),
            this.CHtoWGSlatlng([nextRow[j + 1][0], [nextRow[j + 1][1]]]),
            this.CHtoWGSlatlng([row[j + 1][0], [row[j + 1][1]]]),
          ];
          var value = Math.round(row[j][2] * 1000) / 1000;
          var timediff = -Math.round(
            (datetime.getTime() / 1000 -
              new Date(maxdatetime).getTime() / 1000) /
              3600
          );
          var depthdiff = -Math.round((depth - maxdepth) * 100) / 100;
          var valuestring =
            String(value) +
            String(unit) +
            '<br><div class="tooltipdiff">Diff: ' +
            (timediff > 0 ? "+" : "") +
            String(timediff) +
            "hrs " +
            (depthdiff > 0 ? " +" : " ") +
            String(depthdiff) +
            "m</div>";
          var pixelcolor = getColor(row[j][2], min, max, colors);
          polygons.push(
            L.polygon(coords, {
              color: pixelcolor,
              fillColor: pixelcolor,
              fillOpacity: 1,
              title: row[j][2],
            })
              .bindPopup(
                "<table><tbody>" +
                  '<tr><td colSpan="2"><strong>' +
                  layer.title +
                  "</strong></td></tr>" +
                  "<tr><td class='text-nowrap'><strong>Lake name</strong></td><td>" +
                  "</td></tr>" +
                  "<tr><td class='text-nowrap'><strong>Lake Model</strong></td><td>Meteolakes</td></tr>" +
                  "<tr><td class='text-nowrap'><strong>Data Owner</strong></td><td>Eawag</td></tr>" +
                  "<tr><td><strong>Value at point:</strong></td><td>" +
                  row[j][2] +
                  unit +
                  '</td></tr><tr><td class=\'text-nowrap\'><strong>Link</strong></td><td><a target="_blank" href="' +
                  layer.datasourcelink +
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
    this.raster.push(L.layerGroup(polygons).addTo(this.map));
  };

  meteolakesVector = async (layer, file) => {
    var { maxdatetime, maxdepth, data } = file;
    var {
      vectorArrows,
      vectorMagnitude,
      vectorFlow,
      vectorArrowColor,
      min,
      max,
      colors,
      unit,
      title,
      datasourcelink,
    } = layer;
    var { depth, datetime } = this.props;
    if (vectorMagnitude) {
      var polygons = [];
      var matrix = data;
      for (var i = 0; i < matrix.length - 1; i++) {
        var row = matrix[i];
        var nextRow = matrix[i + 1];
        for (var j = 0; j < row.length - 1; j++) {
          if (
            row[j] === null ||
            nextRow[j] === null ||
            row[j + 1] === null ||
            nextRow[j + 1] === null
          ) {
          } else {
            var coords = [
              this.CHtoWGSlatlng([row[j][0], [row[j][1]]]),
              this.CHtoWGSlatlng([nextRow[j][0], [nextRow[j][1]]]),
              this.CHtoWGSlatlng([nextRow[j + 1][0], [nextRow[j + 1][1]]]),
              this.CHtoWGSlatlng([row[j + 1][0], [row[j + 1][1]]]),
            ];
            var magnitude = Math.abs(
              Math.sqrt(Math.pow(row[j][2], 2) + Math.pow(row[j][3], 2))
            );
            var value = Math.round(magnitude * 1000) / 1000;
            var timediff = -Math.round(
              (datetime.getTime() / 1000 -
                new Date(maxdatetime).getTime() / 1000) /
                3600
            );
            var depthdiff = -Math.round((depth - maxdepth) * 100) / 100;
            var valuestring =
              String(value) +
              String(unit) +
              '<br><div class="tooltipdiff">Diff: ' +
              (timediff > 0 ? "+" : "") +
              String(timediff) +
              "hrs " +
              (depthdiff > 0 ? " +" : " ") +
              String(depthdiff) +
              "m</div>";
            var pixelcolor = getColor(magnitude, min, max, colors);
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
                    layer.name +
                    "</strong></td></tr>" +
                    "<tr><td class='text-nowrap'><strong>Lake name</strong></td><td>" +
                    title +
                    "</td></tr>" +
                    "<tr><td class='text-nowrap'><strong>Lake Model</strong></td><td>Meteolakes</td></tr>" +
                    "<tr><td class='text-nowrap'><strong>Data Owner</strong></td><td>Eawag</td></tr>" +
                    "<tr><td><strong>Northern Water Velocity:</strong></td><td>" +
                    row[j][2] +
                    unit +
                    "<tr><td><strong>Eastern Water Velocity:</strong></td><td>" +
                    row[j][3] +
                    unit +
                    "<tr><td><strong>Magnitude Water Velocity:</strong></td><td>" +
                    valuestring +
                    '</td></tr><tr><td class=\'text-nowrap\'><strong>Link</strong></td><td><a target="_blank" href="' +
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
      this.raster.push(arrows);
    }

    if (vectorFlow) {
    }
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
    } = layer;
    var datasetparameter = datasetparameters.find(
      (dp) => dp.parameters_id === parameters_id
    );
    var { datetime, depth } = this.props;
    var data = file.data;
    var type = datasetparameters.map((dp) => dp.axis + "&" + dp.parameters_id);
    var index, value, minSize, maxSize, markerGroup, timediff, depthdiff;
    var valuestring, color, shape, size, marker;
    if (type.includes("M&1") && type.includes("y&2")) {
      // Profiler e.g Thetis
      var dp2 = datasetparameters.find((dp) => dp.parameters_id === 1);
      var dp3 = datasetparameters.find((dp) => dp.parameters_id === 2);
      index = this.indexClosest(depth, data.y);
      value = parseFloat(data[datasetparameter.axis][index]).toExponential(3);
      minSize = 5;
      maxSize = 30;
      markerGroup = L.layerGroup().addTo(this.map);
      timediff = -Math.round(
        (datetime.getTime() / 1000 - data[dp2.axis][index]) / 3600
      );
      depthdiff = -Math.round((depth - data[dp3.axis][index]) * 100) / 100;
      valuestring =
        String(value) +
        String(datasetparameter.unit) +
        '<br><div class="tooltipdiff">Diff: ' +
        (timediff > 0 ? "+" : "") +
        String(timediff) +
        "hrs " +
        (depthdiff > 0 ? " +" : " ") +
        String(depthdiff) +
        "m</div>";

      color = getColor(value, min, max, colors);
      shape = markerSymbol;
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
          new Date(data[dp2.axis][index] * 1000) +
          "</td></tr>" +
          "<tr><td><strong>Value</strong></td><td>" +
          String(value) +
          String(unit) +
          "</td></tr>" +
          "<tr><td><strong>Depth</strong></td><td>" +
          data[dp3.axis][index] +
          "</td></tr>" +
          '<tr><td class=\'text-nowrap\'><strong>Link</strong></td><td><a target="_blank" href="/datadetail/' +
          datasets_id +
          '">More information</a></td></tr>' +
          "</tbody></table>"
      );

      this.marker.push(markerGroup);
    } else if (type.includes("x&1")) {
      index = this.indexClosest(datetime.getTime() / 1000, data["x"]);
      value = data[datasetparameter.axis][index];
      minSize = 5;
      maxSize = 30;
      markerGroup = L.layerGroup().addTo(this.map);
      timediff = -Math.round(
        (datetime.getTime() / 1000 - data["x"][index]) / 3600
      );
      depthdiff = maxdepth - depth;
      valuestring =
        String(value) +
        String(datasetparameter.unit) +
        '<br><div class="tooltipdiff">Diff: ' +
        (timediff > 0 ? "+" : "") +
        String(timediff) +
        "hrs " +
        (depthdiff > 0 ? " +" : " ") +
        String(depthdiff) +
        "m</div>";

      color = getColor(value, min, max, colors);
      shape = markerSymbol;
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
          new Date(data["x"][index] * 1000) +
          "</td></tr>" +
          "<tr><td><strong>Value</strong></td><td>" +
          String(value) +
          String(unit) +
          "</td></tr>" +
          "<tr><td><strong>Depth</strong></td><td>" +
          maxdepth +
          "</td></tr>" +
          '<tr><td class=\'text-nowrap\'><strong>Link</strong></td><td><a target="_blank" href="/datadetail/' +
          datasets_id +
          '">More information</a></td></tr>' +
          "</tbody></table>"
      );

      this.marker.push(markerGroup);
    } else {
      alert("No plotting function defined");
    }
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

    var topolink =
      "https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ";

    this.baseMaps = {
      datalakesmap,
      swisstopo,
      satellite,
    };

    this.layer = datalakesmap;
    if ("basemap" in this.props) {
      this.layer = this.baseMaps[this.props.basemap];
    }

    this.map = L.map("map", {
      preferCanvas: true,
      zoomControl: false,
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

    //this.layer.addTo(this.map);

    var map = this.map;
    this.map.on("mousemove", function (e) {
      var lat = Math.round(1000 * e.latlng.lat) / 1000;
      var lng = Math.round(1000 * e.latlng.lng) / 1000;
      var a = colorpicker.getColor(e.latlng);
      var h = NaN;
      if (a !== null) {
        h =
          Math.round(
            10 * (-10000 + (a[0] * 256 * 256 + a[1] * 256 + a[2]) * 0.1)
          ) / 10;
      }
      map.attributionControl.setPrefix("(" + lat + "," + lng + ") " + h + "m");
    });

    var { updateLocation } = this.props;
    this.map.on("zoomend", function (e) {
      let zoom = e.target._zoom;
      let latlng = e.target._lastCenter;
      let lat = Math.round(latlng.lat * 1000) / 1000;
      let lng = Math.round(latlng.lng * 1000) / 1000;
      updateLocation(zoom, [lat, lng]);
    });
    this.map.on("moveend", function (e) {
      let zoom = e.target._zoom;
      let latlng = map.getCenter();
      let lat = Math.round(latlng.lat * 1000) / 1000;
      let lng = Math.round(latlng.lng * 1000) / 1000;
      updateLocation(zoom, [lat, lng]);
    });

    // Datalakes logo
    L.control
      .custom({
        position: "bottomright",
        content: '<img src="img/logo.svg">',
        classes: "gis-datalakes-logo",
      })
      .addTo(this.map);

    L.control
      .scale({ position: "bottomright", imperial: false })
      .addTo(this.map);

    this.marker = [];
    this.raster = [];
  }

  updatePlot = () => {
    var { selectedlayers, datasets, center, zoom } = this.props;

    // Remove old layers
    this.marker.forEach((layer) => {
      this.map.removeLayer(layer);
    });
    this.raster.forEach((layer) => {
      this.map.removeLayer(layer);
    });

    function finddataset(fileid, files) {
      return files.find((x) => x.id === fileid);
    }

    // Add new layers
    for (var i = selectedlayers.length - 1; i > -1; i--) {
      var layer = selectedlayers[i];
      if (layer.visible) {
        var dataset = datasets[layer.dataset_index];
        var { fileid } = layer;
        var { mapplotfunction } = dataset;
        var file = finddataset(fileid, dataset.files);

        mapplotfunction === "gitPlot" && this.gitPlot(layer, file);
        mapplotfunction === "foenMarkers" && this.foenMarkers(layer, file);
        mapplotfunction === "meteoSwissMarkers" &&
          this.meteoSwissMarkers(layer, file);
        mapplotfunction === "remoteSensing" && this.remoteSensing(layer, file);
        mapplotfunction === "simstrat" && this.simstrat(layer, file);
        mapplotfunction === "meteolakesScalar" &&
          this.meteolakesScalar(layer, file);
        mapplotfunction === "meteolakesVector" &&
          this.meteolakesVector(layer, file);
      }
    }
    // Set zoom
    window.setTimeout(() => {
      this.map.flyTo(center, zoom, {
        animate: true,
        duration: 1,
      });
    }, 500);
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.loading && !this.props.loading) {
      var updatePlot = this.updatePlot;
      window.setTimeout(() => {
        updatePlot();
      }, 0);
    }
    if (prevProps.basemap !== this.props.basemap) {
      this.map.removeLayer(this.layer);
      this.layer = this.baseMaps[this.props.basemap];
      this.map.addLayer(this.layer);
    }
    if (!this.props.loading && this.state.initial) {
      if (this.props.selectedlayers.length > 0) {
        this.setState({ menu: true, initial: false });
      } else {
        this.setState({ group: true, initial: false });
      }
    }
    this.map.invalidateSize();
  }

  render() {
    var { help, fullsize, menu, group } = this.state;
    var {
      legend,
      timeselector,
      loading,
      sidebar,
      updateState,
      selectedlayers,
    } = this.props;
    var fulllabel = "Fullscreen";
    var fullicon = "\u21F1";
    if (fullsize) {
      fulllabel = "Shrink Map";
      fullicon = "\u21F2";
    }
    return (
      <React.Fragment>
        <div className={fullsize ? "map full" : "map"}>
          <div id="map">
            {loading && (
              <div className="map-loader">
                <Loading />
                Downloading and plotting data
              </div>
            )}
          </div>
          <div className="menu-gis">
            <div className="zoom">
              <div
                className="menu-gis-item one"
                onClick={this.zoomIn}
                title="Zoom In"
              >
                +
              </div>
              <div
                className="menu-gis-item two"
                onClick={this.zoomOut}
                title="Zoom Out"
              >
                −
              </div>
              <div
                className="menu-gis-item three"
                onClick={this.toggleFullsize}
                title={fulllabel}
              >
                {fullicon}
              </div>
            </div>
            <div className="menu-gis-item" onClick={this.toggleMenu}>
              <img title="Edit Layers" src="img/editlayers.svg" alt="Edit Layers"/>
            </div>
            <div className="menu-gis-item" onClick={this.toggleGroup}>
              <img title="Layer Groups" src="img/layergroups.svg" alt="Layer Groups"/>
            </div>

            <div
              className="menu-gis-item"
              onClick={this.toggleHelp}
              title="Help"
            >
              ?
            </div>
          </div>
          <div className="sidebar-gis">
            <div
              className={menu ? "sidebar-gis-inner" : "sidebar-gis-inner hide"}
            >
              <div
                className="sidebar-title"
                onClick={this.toggleMenu}
                title="Hide plot controls"
              >
                Edit Layers
                <div className="sidebar-symbol">{"\u2715"}</div>
              </div>
              <div className="sidebar-content">{sidebar}</div>
            </div>

            <div
              className={
                group ? "sidebar-gis-inner wide" : "sidebar-gis-inner wide hide"
              }
            >
              <div
                className="sidebar-title"
                onClick={this.toggleGroup}
                title="Hide plot controls"
              >
                Layer Groups
                <div className="sidebar-symbol">{"\u2715"}</div>
              </div>
              <div className="sidebar-content">
                <LayerGroups
                  toggleMenu={this.toggleMenu}
                  updateState={updateState}
                  arr={selectedlayers}
                />
              </div>
            </div>

            <div
              className={help ? "sidebar-gis-inner" : "sidebar-gis-inner hide"}
            >
              <div
                className="sidebar-title"
                onClick={this.toggleHelp}
                title="Hide help"
              >
                Help
                <div className="sidebar-symbol">{"\u2715"}</div>
              </div>
              <div className="sidebar-content">{help}</div>
            </div>
          </div>
          <div className="timeselector-gis">{timeselector}</div>
          {legend}
        </div>
      </React.Fragment>
    );
  }
}

export default GISMap;
