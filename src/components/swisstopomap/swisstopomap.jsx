import React, { Component } from 'react';
import L from 'leaflet';
import './swisstopomap.css'
import './leaflet.css';
import Gradient from './gradient';

class ColorBar extends Component {
  render() { 
    if (this.props.mintemp == null){
      return (<div></div>)
    } else {
      return ( 
        <div id="colorbar" title="Legend colorbar"> { this.props.mintemp } °C <div id="bar"></div> { this.props.maxtemp } °C </div>
      );
    }   
  }
}

class SwissTopoMap extends Component {

  state = {
    addClass: false
  }
  
  toggle = () => {
    this.setState({addClass: !this.state.addClass});
  }

  sendMap = (map) => {
    this.props.setMap(map);
  }

  componentDidMount() {
    var center = [46.85, 7.55];
    if ('center' in this.props) { center = this.props.center };
    var zoom = 8;
    if ('zoom' in this.props) { zoom = this.props.zoom };
  
    this.map = L.map('map', {
      center: center,
      zoom: zoom,
      minZoom: 7,
      layers: [
        //L.tileLayer('https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg')
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}')
      ]
    });

    // set attribution
    this.map.attributionControl.addAttribution('<a title="Swiss Federal Office of Topography" href="https://www.swisstopo.admin.ch/">swisstopo</a>');

    // set bounds
    var southWest = L.latLng(44.40,3.95);
    var northEast = L.latLng(48.55,13.06);
    var bounds = L.latLngBounds(southWest, northEast);
    this.map.setMaxBounds(bounds);

    // draw points
    this.plotMarkers(this.props);

    // draw geojson
    this.plotGeoJSON(this.props);

    if ('setMap' in this.props) {
      this.sendMap(this.map);
    }
  }

  componentDidUpdate(prevProps, prevState){
    this.plotMarkers(this.props);
    this.plotGeoJSON(this.props);
  }

  plotMarkers = props => {
    if ('markers' in props) {
      var Icon = L.icon({
        iconUrl: './img/DW.svg',
        iconSize:     [12, 12]
      });

      for (var marker of props.markers) {
          if ('icon' in marker) {
            Icon = L.icon({
              iconUrl: "./img/"+marker['icon']+".svg",
              iconSize:     [9, 9]
            });
          }

          var mark = new L.marker([marker["lat"],marker["lon"]], {icon: Icon}).addTo(this.map);
          
          if ('popup' in marker) {
            mark.bindPopup(marker["popup"]);
          }  

          if ('tooltip' in marker) {
              mark.bindTooltip(marker["tooltip"], {permanent: true, direction:"top",interactive: true});
          }   
      }
    }
  }

  plotGeoJSON = props => {
    if ('geojson' in props && 'popupfunction' in props && 'colorbar' in props) {
      let LakeStyle = props.geojsonstyle;
      let GeoPopupFunction = props.popupfunction;
      let mintemp = props.colorbar[0];
      let maxtemp = props.colorbar[1];
      let geojson = {"type": "FeatureCollection", 
                     "name": "Swiss Lake Models", 
                     "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}}, 
                     "features": props.geojson };
      L.geoJSON(geojson, {
        style: function (layer) {
            return LakeStyle(Gradient.colors,layer.properties,mintemp,maxtemp);
        }
    }).bindPopup(function (layer) {
        return GeoPopupFunction(layer.feature.properties)
    }).addTo(this.map);
    }
  }

  render() {
    var mintemp = null;
    var maxtemp = null;
    if ('colorbar' in this.props) {
      mintemp = this.props.colorbar[0];
      maxtemp = this.props.colorbar[1];
    }
    var help = "";
    if ('help' in this.props) { help = this.props.help };

    let helpContainer = "help-container";
    if(this.state.addClass) {
        helpContainer = "help-container show";
      }

    return <React.Fragment>
              <div id="map">
                <div title="View user guide" onClick={this.toggle.bind(this)} className="help">?</div>
                <div className={helpContainer}>
                  <div onClick={this.toggle.bind(this)} className="help-top" title="Click to hide user guide">
                    <h3>
                      <div className="help-title">User Guide</div> 
                      <span> &#215; </span>
                    </h3>
                  </div>
                  <div className="help-content">{help}</div>
                </div>
                <ColorBar mintemp={ mintemp } maxtemp={ maxtemp }/>
                </div>
          </React.Fragment> 
  }
}

export default SwissTopoMap;