import React, { Component } from "react";
import ReactDOM from "react-dom";
import L from "leaflet";
import "leaflet.markercluster";
import "./custommap.css";
import "./leaflet.css";
import "./markercluster.css";
import "./markerclusterdefault.css";
import "./marker.css";

class MapSelect extends Component {
  state = {
    addClass: false
  };

  toggle = () => {
    this.setState({ addClass: !this.state.addClass });
  };

  sendMap = map => {
    this.props.setMap(map);
  };

  componentDidMount() {
    const { datasets } = this.props;
    var center = [46.85, 7.55];
    var zoom = 8;

    this.map = L.map("map", {
      center: center,
      zoom: zoom,
      minZoom: 7,
      layers: [
        //L.tileLayer('https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg', {attribution: '<a title="Swiss Federal Office of Topography" href="https://www.swisstopo.admin.ch/">swisstopo</a>'})
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          { attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ" }
        )
      ]
    });

    // set bounds
    var southWest = L.latLng(44.4, 3.95);
    var northEast = L.latLng(48.55, 13.06);
    var bounds = L.latLngBounds(southWest, northEast);
    this.map.setMaxBounds(bounds);

    // plot markers
    this.plotMarkers(datasets);
  }

  componentDidUpdate() {
    this.map.invalidateSize();
    const { datasets } = this.props;
    this.plotMarkers(datasets);
  }

  plotMarkers = datasets => {
    try {
      this.map.removeLayer(this.markers);
    } catch (e) {}
    var shape = "pin"
    var color = "red";
    var Icon = L.divIcon({
        className: "map-marker",
        html: '<div class="'+shape+'" style="background-color:'+color+'"></div>'
      });
    this.markers = L.markerClusterGroup();
    for (var dataset of datasets) {
      this.markers.addLayer(
        new L.marker([dataset.latitude, dataset.longitude], {
          icon: Icon
        }).bindPopup(dataset.title)
      );
    }
    this.map.addLayer(this.markers);
  };
  render() {
    return (
      <React.Fragment>
        <div className="map">
          <div id="map"></div>
        </div>
      </React.Fragment>
    );
  }
}

export default MapSelect;
