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

  meteoSwissMarkers = async (layer, data) => {
    var minSize = 5;
    var maxSize = 30;
    var layerData = JSON.parse(JSON.stringify(layer.data.features));
    var markerGroup = L.layerGroup().addTo(this.map);
    var { markerLabel, min, max } = layer;
    var marker, value, color, shape, size, latlng, valuestring;
    var rotation = 0;
    for (var j = 0; j < layerData.length; j++) {
      value = layerData[j].properties.value;
      valuestring = String(value) + String(layerData[j].properties.unit);
      color = getColor(value, min, max, layer.colors);
      shape = layer.markerSymbol;
      if (layer.markerFixedSize) {
        size = layer.markerSize;
      } else {
        size = ((value - min) / (max - min)) * (maxSize - minSize) + minSize;
      }
      if ("wind_direction" in layerData[j].properties)
        rotation = layerData[j].properties.wind_direction + 180;
      latlng = this.CHtoWGSlatlng(layerData[j].geometry.coordinates);
      marker = new L.marker(latlng, {
        icon: L.divIcon({
          className: "map-marker",
          html:
            `<div style="padding:10px;transform:translate(-12px, -12px);position: absolute;">` +
            `<div class="${shape}" style="background-color:${color};height:${size}px;width:${size}px;transform: rotate(${rotation}deg)">` +
            `</div></div> `,
        }),
      })
        .bindTooltip(valuestring, {
          permanent: markerLabel,
          direction: "top",
        })
        .addTo(markerGroup);
      marker.bindPopup(layerData[j].properties.description);
    }
    this.marker.push(markerGroup);
  };

  remoteSensing = async (layer, data) => {
    var { min, max, unit } = layer;
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
      var valuestring = String(Math.round(data.v[i] * 1000) / 1000) + unit;
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
              layer.name +
              "</strong></td></tr>" +
              "<tr><td class='text-nowrap'><strong>Satellite</strong></td><td>Sentinal 3</td></tr>" +
              "<tr><td class='text-nowrap'><strong>Data Owner</strong></td><td>Eawag</td></tr>" +
              "<tr><td><strong>Value at point:</strong></td><td>" +
              valuestring +
              '</td></tr><tr><td class=\'text-nowrap\'><strong>Link</strong></td><td><a target="_blank" href="' +
              "" +
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
    var layerData = JSON.parse(JSON.stringify(layer.data));
    var { min, max } = layer;
    var polygons = [];
    for (var i = 0; i < layerData.length; i++) {
      var pixelcolor = getColor(layerData[i].value, min, max, layer.colors);
      var valuestring = String(layerData[i].value) + "°C";
      polygons.push(
        L.polygon(layerData[i].latlng, {
          color: pixelcolor,
          fillColor: pixelcolor,
          fillOpacity: 1,
          title: layerData[i].value,
        })
          .bindPopup(
            "<table><tbody>" +
              "<tr><td class='text-nowrap'><strong>Lake name</strong></td><td>" +
              layerData[i].name +
              "</td></tr>" +
              "<tr><td class='text-nowrap'><strong>Lake Model</strong></td><td>Simstrat</td></tr>" +
              "<tr><td class='text-nowrap'><strong>Data Owner</strong></td><td>Eawag</td></tr>" +
              "<tr><td><strong>Surface water temperature:</strong></td><td>" +
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
    var { min, max, colors } = layer;
    var matrix, polygons;
    for (var k = 0; k < data.length; k++) {
      polygons = [];
      matrix = data[k].data;
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
            var valuestring = String(row[j][2]) + data[k].unit;
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
                    layer.name +
                    "</strong></td></tr>" +
                    "<tr><td class='text-nowrap'><strong>Lake name</strong></td><td>" +
                    data[k].name +
                    "</td></tr>" +
                    "<tr><td class='text-nowrap'><strong>Lake Model</strong></td><td>Meteolakes</td></tr>" +
                    "<tr><td class='text-nowrap'><strong>Data Owner</strong></td><td>Eawag</td></tr>" +
                    "<tr><td><strong>Value at point:</strong></td><td>" +
                    row[j][2] +
                    data[k].unit +
                    '</td></tr><tr><td class=\'text-nowrap\'><strong>Link</strong></td><td><a target="_blank" href="' +
                    data[k].link +
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
    } = layer;

    if (vectorMagnitude) {
      var matrix, polygons;
      for (var k = 0; k < data.length; k++) {
        polygons = [];
        matrix = data[k].data;
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
                String(Math.round(magnitude * 1000) / 1000) + data[k].unit;
              var pixelcolor = getColor(magnitude, min, max, layer.colors);
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
                      data[k].name +
                      "</td></tr>" +
                      "<tr><td class='text-nowrap'><strong>Lake Model</strong></td><td>Meteolakes</td></tr>" +
                      "<tr><td class='text-nowrap'><strong>Data Owner</strong></td><td>Eawag</td></tr>" +
                      "<tr><td><strong>Northern Water Velocity:</strong></td><td>" +
                      row[j][2] +
                      data[k].unit +
                      "<tr><td><strong>Eastern Water Velocity:</strong></td><td>" +
                      row[j][3] +
                      data[k].unit +
                      "<tr><td><strong>Magnitude Water Velocity:</strong></td><td>" +
                      valuestring +
                      '</td></tr><tr><td class=\'text-nowrap\'><strong>Link</strong></td><td><a target="_blank" href="' +
                      data[k].link +
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
    }

    if (vectorArrows) {
      for (k = 0; k < data.length; k++) {
        var arrows = L.vectorField(data[k].data, {
          vectorArrowColor,
          colors,
          min,
          max,
          size: 15,
        }).addTo(this.map);
        this.raster.push(arrows);
      }
    }

    if (vectorFlow) {
    }
  };

  gitPlot = async (layer, file) => {
    var {
      datasetparameters,
      parameters_id,
      markerLabel,
      min,
      max,
      colors,
      markerSymbol,
      markerFixedSize,
      markerSize,
      description,
      latitude,
      longitude,
    } = layer;
    var datasetparameter = datasetparameters.find(
      (dp) => dp.parameters_id === parameters_id
    );
    var { datetime, depth } = this.props;
    var data = file.data;
    var type = datasetparameters.map((dp) => dp.axis + "&" + dp.parameters_id);
    if (type.includes("M&1") && type.includes("y&2")) {
      // Profiler e.g Thetis
      var index = this.indexClosest(depth, data.y);
      var value = data[datasetparameter.axis][index];
      var minSize = 5;
      var maxSize = 30;
      var markerGroup = L.layerGroup().addTo(this.map);
      var valuestring = String(value) + String(datasetparameter.unit);
      var color = getColor(value, min, max, colors);
      var shape = markerSymbol;
      var size;
      if (markerFixedSize) {
        size = markerSize;
      } else {
        size = ((value - min) / (max - min)) * (maxSize - minSize) + minSize;
      }
      var marker = new L.marker([latitude, longitude], {
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
      marker.bindPopup(description);

      this.marker.push(markerGroup);
    } else {
      alert("No plotting function defined");
    }
  };

  indexClosest = (num, arr) => {
    var curr = arr[0];
    var diff = Math.abs(num - curr);
    for (var val = 0; val < arr.length; val++) {
      var newdiff = Math.abs(num - arr[val]);
      if (newdiff < diff) {
        diff = newdiff;
        curr = val;
      }
    }
    return curr;
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
      maxZoom: 16,
      attributionControl: false,
      layers: [
        //L.tileLayer('https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg', {attribution: '<a title="Swiss Federal Office of Topography" href="https://www.swisstopo.admin.ch/">swisstopo</a>'}),
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          { attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ" }
        ),
        L.tileLayer(
          "https://maps.heigit.org/openmapsurfer/tiles/asterh/webmercator/{z}/{x}/{y}.png",
          {
            maxZoom: 10,
            attribution:
              '| <a href="http://giscience.uni-hd.de/" target="_blank">University of Heidelberg</a> | <a href="https://lpdaac.usgs.gov/products/aster_policies" target="_blank">ASTER GDEM</a>, <a href="http://srtm.csi.cgiar.org/">SRTM</a>',
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
        mapplotfunction === "meteoSwissMarkers" &&
          this.meteoSwissMarkers(layer, data);
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
