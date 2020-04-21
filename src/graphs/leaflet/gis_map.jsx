import React, { Component } from "react";
import L from "leaflet";
import "./leaflet_vectorField";
import "./leaflet_customcontrol";
import { getColor } from "../../components/gradients/gradients";
import Loading from "../../components/loading/loading";
import "./css/gis_map.css";
import "./css/leaflet.css";

class GISMap extends Component {
  state = {
    help: false,
    fullsize: false,
    loading: false,
    menu: window.innerWidth > 500,
  };

  toggleHelp = () => {
    this.setState({ help: !this.state.help });
  };

  toggleFullsize = () => {
    this.setState({ fullsize: !this.state.fullsize });
  };

  toggleMenu = () => {
    this.setState({ menu: !this.state.menu });
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

  remoteSensing = async (layer, data) => {
    var { min, max, unit, maxdatetime, maxdepth } = layer;
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

  simstrat = async (layer, data) => {
    var layerData = JSON.parse(JSON.stringify(data));
    var { min, max, maxdatetime } = layer;
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

  meteolakesScalar = async (layer, data) => {
    var { min, max, colors, unit } = layer;
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
          var valuestring = String(row[j][2]) + unit;
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

  meteolakesVector = async (layer, data) => {
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
      datasourcelink
    } = layer;

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
            var valuestring =
              String(Math.round(magnitude * 1000) / 1000) + unit;
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

    var toggleHelp = this.toggleHelp;
    var toggleFullsize = this.toggleFullsize;
    var toggleMenu = this.toggleMenu;

    this.map = L.map("map", {
      preferCanvas: true,
      center: center,
      zoom: zoom,
      minZoom: 7,
      maxZoom: 15,
      attributionControl: false,
      layers: [
        L.tileLayer(
          "https://api.mapbox.com/styles/v1/jamesrunnalls/ck96x8fhp6h2i1ik5q9xz0iqn/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ",
          {
            attribution:
              '&copy; <a href="https://shop.swisstopo.admin.ch/en/products/height_models/bathy3d">swisstopo</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          }
        ),
      ],
    });

    L.control.attribution({ position: "bottomright" }).addTo(this.map);

    // Menu
    L.control
      .custom({
        position: "topleft",
        content:
          '<div class="customcontrol" title="Menu" id="sidebar">\u2630</div>',
        classes: "leaflet-bar",
        events: {
          click: function (data) {
            toggleMenu();
          },
        },
      })
      .addTo(this.map);

    // Full screen
    L.control
      .custom({
        position: "topleft",
        content:
          '<div class="customcontrol" title="Full screen" id="fullsize">&#8689;</div>',
        classes: "leaflet-bar",
        events: {
          click: function (data) {
            toggleFullsize();
          },
        },
      })
      .addTo(this.map);

    // Help
    L.control
      .custom({
        position: "topleft",
        content: '<div class="customcontrol" title="Help">?</div>',
        classes: "leaflet-bar",
        events: {
          click: function (data) {
            toggleHelp();
          },
        },
      })
      .addTo(this.map);

    // Menu
    L.control
      .custom({
        position: "bottomright",
        content: '<img src="img/logo.svg">',
        classes: "gis-datalakes-logo",
      })
      .addTo(this.map);

    this.marker = [];
    this.raster = [];
  }

  updatePlot = () => {
    var { selectedlayers, datasets } = this.props;

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
        var data = file.data;

        mapplotfunction === "gitPlot" && this.gitPlot(layer, file);
        mapplotfunction === "foenMarkers" && this.foenMarkers(layer, file);
        mapplotfunction === "meteoSwissMarkers" &&
          this.meteoSwissMarkers(layer, file);
        mapplotfunction === "remoteSensing" && this.remoteSensing(layer, data);
        mapplotfunction === "simstrat" && this.simstrat(layer, data);
        mapplotfunction === "meteolakesScalar" &&
          this.meteolakesScalar(layer, data);
        mapplotfunction === "meteolakesVector" &&
          this.meteolakesVector(layer, data);
      }
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.loading && !this.props.loading) {
      var updatePlot = this.updatePlot;
      window.setTimeout(() => {
        updatePlot();
      }, 0);
    }
    this.map.invalidateSize();
  }

  render() {
    var { help, fullsize, menu } = this.state;
    var { legend, timeselector, loading, sidebar } = this.props;
    if (!loading)
      document.getElementById("fullsize").innerHTML = fullsize
        ? "&#8690;"
        : "&#8689;";
    if (!loading)
      document.getElementById("fullsize").title = fullsize
        ? "Shrink map"
        : "Fullscreen";
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
          <div className="sidebar-gis">
            <div
              className={menu ? "sidebar-gis-inner" : "sidebar-gis-inner hide"}
            >
              <div
                className="sidebar-title"
                onClick={this.toggleMenu}
                title="Hide plot controls"
              >
                Plot Controls
                <div className="sidebar-symbol">{"\u2715"}</div>
              </div>
              <div className="sidebar-content">{sidebar}</div>
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
