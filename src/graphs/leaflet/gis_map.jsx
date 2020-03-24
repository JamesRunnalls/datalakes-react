import "./custommap.css";
import "./leaflet.css";
import React, { Component } from "react";
import L from "leaflet";
import "leaflet-canvas-layer";
import { getColor } from "../../components/gradients/gradients";
import Loading from "../../components/loading/loading";

class GISMap extends Component {
  state = {
    help: false,
    fullsize: false,
    loading: false
  };

  toggleHelp = () => {
    this.setState({ help: !this.state.help });
  };

  toggleFullsize = () => {
    this.setState({ fullsize: !this.state.fullsize });
  };

  hoverOver = e => {
    this.props.hoverFunc(e.target, "over");
  };

  hoverOut = e => {
    this.props.hoverFunc(e.target, "out");
  };

  CHtoWGSlatlng = yx => {
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

  meteoSwissMarkers = async layer => {
    var minSize = 5;
    var maxSize = 30;
    var layerData = JSON.parse(JSON.stringify(layer.data.features));
    var markerGroup = L.layerGroup().addTo(this.map);
    var { markerLabel, min, max } = layer;
    var marker, value, color, shape, size, latlng, valuestring;
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
      latlng = this.CHtoWGSlatlng(layerData[j].geometry.coordinates);
      marker = new L.marker(latlng, {
        icon: L.divIcon({
          className: "map-marker",
          html: `<div style="padding:10px;transform:translate(-4px, -4px)"><div class="${shape}" style="background-color:${color};height:${size}px;width:${size}px;"></div></div> `
        })
      })
        .bindTooltip(valuestring, {
          permanent: markerLabel,
          direction: "top"
        })
        .addTo(markerGroup);
      marker.bindPopup(layerData[j].properties.description);
    }
    this.marker.push(markerGroup);
  };

  remoteSensing = async layer => {
    var { min, max, data } = layer;
    var polygons = [];
    var coords;
    var x = data.lonres / 2;
    var y = data.latres / 2;
    for (var i = 0; i < data.lon.length; i++) {
      coords = [
        [data.lat[i] - y, data.lon[i] - x],
        [data.lat[i] + y, data.lon[i] - x],
        [data.lat[i] + y, data.lon[i] + x],
        [data.lat[i] - y, data.lon[i] + x]
      ];
      var valuestring = String(Math.round(data.v[i] * 1000) / 1000);
      var pixelcolor = getColor(data.v[i], min, max, layer.colors);
      polygons.push(
        L.polygon(coords, {
          color: pixelcolor,
          fillColor: pixelcolor,
          fillOpacity: 1,
          title: data.v[i]
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
            direction: "top"
          })
      );
    }
    this.raster.push(L.layerGroup(polygons).addTo(this.map));
  };

  simstrat = async layer => {
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
          title: layerData[i].value
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
            direction: "top"
          })
      );
    }
    this.raster.push(L.layerGroup(polygons).addTo(this.map));
  };

  meteolakesScalar = async layer => {
    var { data, min, max } = layer;
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
              this.CHtoWGSlatlng([row[j + 1][0], [row[j + 1][1]]])
            ];
            var valuestring = String(row[j][2]) + data[k].unit;
            var pixelcolor = getColor(row[j][2], min, max, layer.colors);
            polygons.push(
              L.polygon(coords, {
                color: pixelcolor,
                fillColor: pixelcolor,
                fillOpacity: 1,
                title: row[j][2]
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
                  direction: "top"
                })
            );
          }
        }
      }
      this.raster.push(L.layerGroup(polygons).addTo(this.map));
    }
  };

  meteolakesVector = async layer => {
    var { data, vectorArrows, vectorMagnitude, vectorFlow, min, max } = layer;

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
                this.CHtoWGSlatlng([row[j + 1][0], [row[j + 1][1]]])
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
                  title: magnitude
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
                    direction: "top"
                  })
              );
            }
          }
        }
        this.raster.push(L.layerGroup(polygons).addTo(this.map));
      }
    }

    if (vectorArrows) {
    }

    if (vectorFlow) {
    }
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

    this.map = L.map("map", {
      preferCanvas: true,
      center: center,
      zoom: zoom,
      minZoom: 7,
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
            attribution:
              'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> | Map data  <a href="https://lpdaac.usgs.gov/products/aster_policies">ASTER GDEM</a>, <a href="http://srtm.csi.cgiar.org/">SRTM</a>'
          }
        )
      ]
    });

    L.control.attribution({ position: "bottomleft" }).addTo(this.map);

    // Add attribution
    this.map.attributionControl.setPrefix(
      'datalakes © | <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
    );

    // Full screen
    L.control
      .custom({
        position: "topleft",
        content: '<div class="customcontrol" title="Full screen">&#10529</div>',
        classes: "leaflet-bar",
        events: {
          click: function(data) {
            toggleFullsize();
          }
        }
      })
      .addTo(this.map);

    // Help
    L.control
      .custom({
        position: "topleft",
        content: '<div class="customcontrol" title="Help">?</div>',
        classes: "leaflet-bar",
        events: {
          click: function(data) {
            toggleHelp();
          }
        }
      })
      .addTo(this.map);

    // set bounds
    var southWest = L.latLng(44.4, 3.95);
    var northEast = L.latLng(48.55, 13.06);
    var bounds = L.latLngBounds(southWest, northEast);
    this.map.setMaxBounds(bounds);
    this.marker = [];
    this.raster = [];
  }

  updatePlot = () => {
    var { maplayers, hidden } = this.props;

    // Remove old layers
    this.marker.forEach(layer => {
      this.map.removeLayer(layer);
    });
    this.raster.forEach(layer => {
      this.map.removeLayer(layer);
    });

    // Add new layers
    for (var i = maplayers.length - 1; i > -1; i--) {
      if (!hidden.includes(maplayers[i].id)) {
        var layer = maplayers[i];
        var { plotFunction } = layer;
        plotFunction === "meteoSwissMarkers" && this.meteoSwissMarkers(layer);
        plotFunction === "remoteSensing" && this.remoteSensing(layer);
        plotFunction === "simstrat" && this.simstrat(layer);
        plotFunction === "meteolakesScalar" && this.meteolakesScalar(layer);
        plotFunction === "meteolakesVector" && this.meteolakesVector(layer);
      }
    }
  };

  componentDidUpdate(prevProps, prevState) {
    this.updatePlot();
    this.map.invalidateSize();
    document.getElementById("gisloading").style.display = "none";
  }

  render() {
    var { help, fullsize } = this.state;
    var { legend, selector } = this.props;
    return (
      <React.Fragment>
        <div className={fullsize ? "map full" : "map"}>
          <div id="map">
            <div id="gisloading" className="map-loader">
              <Loading />
              Downloading and plotting data
            </div>
            {help && (
              <div className="help-container show">
                <div
                  onClick={this.toggleHelp}
                  className="help-top"
                  title="Click to hide user guide"
                >
                  <h3>
                    <div className="help-title">User Guide</div>
                    <span> &#215; </span>
                  </h3>
                </div>
                <div className="help-content">{help}</div>
              </div>
            )}
          </div>
          {legend}
          {selector}
        </div>
      </React.Fragment>
    );
  }
}

export default GISMap;