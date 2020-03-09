import "./custommap.css";
import "./leaflet.css";
import React, { Component } from "react";
import L from "leaflet";
import Loading from "../../components/loading/loading";
import { getColor } from "../../components/gradients/gradients";

class PredictionMap extends Component {
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
      layers: [
        //L.tileLayer('https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg', {attribution: '<a title="Swiss Federal Office of Topography" href="https://www.swisstopo.admin.ch/">swisstopo</a>'})
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          { attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ" }
        )
      ]
    });

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
    this.refs.loadingp.style.display = "block";
    this.plotGeoJSON(this.props);
    this.plotPolygons(this.props);
    this.map.invalidateSize();
  }

  showPolygonTemp = e => {
    this.props.setTemp(e.target.options.title);
  };

  showGeojsonTemp = e => {
    this.props.setTemp(e);
  };

  hideGeojsonTemp = () => {
    this.props.hideTemp();
  };

  hoverOver = e => {
    this.props.hoverFunc(e.target, "over");
  };

  hoverOut = e => {
    this.props.hoverFunc(e.target, "out");
  };

  plotPolygons = props => {
    if ("threeD" in props) {
      // Remove old layers
      if ("polygons" in this) {
        this.map.removeLayer(this.polygons);
      }

      var lakes = [];
      const findLake = (geo, lake) => {
        return geo.find(c => c.properties.name === lake.name);
      };
      var { min, max, colors } = this.props;
      for (var lake of props.threeD) {
        // Plot polygons
        var polygons = [];
        let GeoPopupFunction = props.popupfunction;
        for (var px of lake.data) {
          var lakecolor = getColor(px["v"], min, max, colors);
          polygons.push(
            L.polygon(px["g"], {
              color: lakecolor,
              fillColor: lakecolor,
              fillOpacity: 1,
              title: px["v"]
            })
              .on({ mouseover: this.hoverOver })
              .on({ mouseout: this.hoverOut })
          );
        }
        var popup = findLake(props.geojson, lake);
        lakes.push(
          L.featureGroup(polygons)
            .bindPopup(GeoPopupFunction(popup.properties))
            .addTo(this.map)
        );
      }
      this.polygons = L.layerGroup(lakes);
      this.refs.loadingp.style.display = "none";
    }
  };

  plotGeoJSON = props => {
    if ("geojson" in props && "popupfunction" in props) {
      if ("geojson" in this) {
        this.map.removeLayer(this.geojson);
      }
      var { min, max, colors } = this.props;
      let GeoPopupFunction = props.popupfunction;
      let geojson = {
        type: "FeatureCollection",
        name: "Swiss Lake Models",
        crs: {
          type: "name",
          properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" }
        },
        features: props.geojson
      };
      this.geojson = L.geoJSON(geojson, {
        style: layer => {
          var lakeTemp = layer.properties.surfacetemperature;
          var lakeColor = getColor(lakeTemp, min, max, colors);
          var fillopacity = 1;
          var opacity = 1;
          return {
            color: lakeColor,
            fillOpacity: fillopacity,
            opacity: opacity
          };
        }
      })
        .bindPopup(layer => {
          return GeoPopupFunction(layer.feature.properties);
        })
        .addTo(this.map);
    }
  };

  render() {
    var { help, fullsize } = this.state;
    var { legend, hover } = this.props;
    return (
      <React.Fragment>
        <div className={fullsize ? "map full" : "map"}>
          <div id="map">
            <div ref="loadingp" className="map-loader">
              <Loading />
              Downloading map data
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
          {hover}
        </div>
      </React.Fragment>
    );
  }
}

export default PredictionMap;
