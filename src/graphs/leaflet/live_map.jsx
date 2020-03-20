import "./custommap.css";
import "./leaflet.css";
import React, { Component } from "react";
import L from "leaflet";
import { getColor } from "../../components/gradients/gradients";

class LiveMap extends Component {
  state = {
    help: false,
    fullsize: false
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

  plotMarkers = async () => {
    var {
      visibleMarkers,
      markerData,
      markerGroups,
      popup,
      markerOpacity
    } = this.props;
    // Remove old markers
    if ("markerGroup" in this) {
      this.map.removeLayer(this.markerGroup);
    }
    this.markerGroup = L.layerGroup().addTo(this.map);

    var i,
      j,
      marker,
      color,
      shape,
      markerValue,
      groupInfo,
      markerInfo,
      markerPopup;
    // Loop over visible marker groups
    for (i = 0; i < visibleMarkers.length; i++) {
      markerValue = visibleMarkers[i];
      groupInfo = this.findGroupInfo(markerGroups, markerValue);
      color = groupInfo.color;
      shape = groupInfo.shape;

      // Loop over markers
      for (j = 0; j < markerData[markerValue].length; j++) {
        // Set icon values
        markerInfo = markerData[markerValue][j];
        markerPopup = popup(markerInfo);
        marker = new L.marker([markerInfo["lat"], markerInfo["lon"]], {
          icon: L.divIcon({
            className: "map-marker",
            html: `<div class="${shape}" style="background-color:${color};opacity:${markerOpacity}"></div> `
          })
        }).addTo(this.markerGroup);
        marker.bindPopup(markerPopup);
      }
    }
  };

  plotPolygons = async () => {
    try {
      this.map.removeLayer(this.polygonLayer);
    } catch (e) {}
    if (!this.props.loading) {
      var { polygon: data, polygonOpacity, colors, min, max } = this.props;

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
        var pixelcolor = getColor(data.v[i], min, max, colors);
        polygons.push(
          L.polygon(coords, {
            color: pixelcolor,
            fillColor: pixelcolor,
            fillOpacity: polygonOpacity,
            opacity: polygonOpacity,
            title: data.v[i]
          })
            .on({ mouseover: this.hoverOver })
            .on({ mouseout: this.hoverOut })
        );
      }
      this.polygonLayer = L.layerGroup(polygons).addTo(this.map);
    }
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

  meteoSwissMarkers = async (layer, min, max) => {
    var minSize = 5;
    var maxSize = 30;
    var parseArray = layer.parseArray.split(",");
    var layerData = JSON.parse(JSON.stringify(layer.data));

    for (var i = 0; i < parseArray.length; i++) {
      layerData = layerData[parseArray[i]];
    }

    var markerGroup = L.layerGroup().addTo(this.map);

    var marker, value, color, shape, size, latlng;
    for (var j = 0; j < layerData.length; j++) {
      value = layerData[j].properties.value;
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
          html: `<div class="${shape}" style="background-color:${color};height:${size}px;width:${size}px;"></div> `
        })
      }).addTo(markerGroup);
      marker.bindPopup(layerData[j].properties.description);
    }
    this.marker.push(markerGroup);
  };

  remoteSensing = async (layer, min, max) => {
    var data = layer.data;
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
      var pixelcolor = getColor(data.v[i], min, max, layer.colors);
      polygons.push(
        L.polygon(coords, {
          color: pixelcolor,
          fillColor: pixelcolor,
          fillOpacity: 1,
          title: data.v[i]
        })
          .on({ mouseover: this.hoverOver })
          .on({ mouseout: this.hoverOut })
      );
    }
    this.raster.push(L.layerGroup(polygons).addTo(this.map));
  };

  simstrat = async (layer, min, max) => {
    var layerData = JSON.parse(JSON.stringify(layer.data));
    var polygons = [];
    for (var i = 0; i < layerData.length; i++) {
      var pixelcolor = getColor(layerData[i].value, min, max, layer.colors);
      polygons.push(
        L.polygon(layerData[i].latlng, {
          color: pixelcolor,
          fillColor: pixelcolor,
          fillOpacity: 1,
          title: layerData[i].value
        }).bindPopup(
          "<table><tbody>" +
            "<tr><td class='text-nowrap'><strong>Lake name</strong></td><td>"+layerData[i].name+"</td></tr>" +
            "<tr><td class='text-nowrap'><strong>Lake Model</strong></td><td>Simstrat</td></tr>" +
            "<tr><td class='text-nowrap'><strong>Data Owner</strong></td><td>Eawag</td></tr>" +
            "<tr><td><strong>Surface water temperature:</strong></td><td>"+layerData[i].value+"°C</td></tr>" +
            "<tr><td class='text-nowrap'><strong>Elevation</strong></td><td>"+layerData[i].elevation+"m</td></tr>" +
            "<tr><td class='text-nowrap'><strong>Depth</strong></td><td>"+layerData[i].depth+" m</td></tr>" +
            '<tr><td class=\'text-nowrap\'><strong>Link</strong></td><td><a target="_blank" href="'+layerData[i].link+'">Information about this lake model</a></td></tr>' +
            "</tbody></table>"
        )
      );
    }
    this.raster.push(L.layerGroup(polygons).addTo(this.map));
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

  componentDidUpdate(prevProps, prevState) {
    var { selected, maplayers, parameters } = this.props;
    var { selected: prevSelected } = prevProps;

    // Remove old layers
    this.marker.forEach(layer => {
      this.map.removeLayer(layer);
    });
    this.raster.forEach(layer => {
      this.map.removeLayer(layer);
    });

    function findlayer(maplayers, id) {
      return maplayers.find(x => x.id === id);
    }
    function findparameter(parameters, id) {
      return parameters.find(x => x.id === id);
    }

    // Add new layers
    for (var i = 0; i < selected.length; i++) {
      var layer = findlayer(maplayers, selected[i]);
      var { plotFunction, parameters_id } = layer;
      var parameter = findparameter(parameters, parameters_id);
      var { min, max } = parameter;
      plotFunction === "meteoSwissMarkers" &&
        this.meteoSwissMarkers(layer, min, max);
      plotFunction === "remoteSensing" && this.remoteSensing(layer, min, max);
      plotFunction === "simstrat" && this.simstrat(layer, min, max);
    }
    this.map.invalidateSize();
  }

  render() {
    var { help, fullsize } = this.state;
    var { legend, selector } = this.props;
    return (
      <React.Fragment>
        <div className={fullsize ? "map full" : "map"}>
          <div id="map">
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

export default LiveMap;
