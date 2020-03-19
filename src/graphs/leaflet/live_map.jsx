import "./custommap.css";
import "./leaflet.css";
import React, { Component } from "react";
import L from "leaflet";
import Loading from "../../components/loading/loading";
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

  sendMap = map => {
    this.props.setMap(map);
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
        //L.tileLayer('https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg', {attribution: '<a title="Swiss Federal Office of Topography" href="https://www.swisstopo.admin.ch/">swisstopo</a>'})
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          { attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ" }
        )
      ]
    });

    L.control.attribution({position: 'bottomleft'}).addTo(this.map);

    // Add attribution
    this.map.attributionControl.setPrefix('datalakes © | <a href="https://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>');

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

    if ("setMap" in this.props) {
      this.sendMap(this.map);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    //this.refs.loadingl.style.display = "block";
    this.plotPolygons();
    this.plotMarkers();
    this.map.invalidateSize();
  }

  hoverOver = e => {
    this.props.hoverFunc(e.target, "over");
  };

  hoverOut = e => {
    this.props.hoverFunc(e.target, "out");
  };

  findGroupInfo = (group, value) => {
    return group.find(x => x.value === value);
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
