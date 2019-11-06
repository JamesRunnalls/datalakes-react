import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import L from 'leaflet';
import './swisstopomap.css'
import './leaflet.css';
import Gradient from './gradient';


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
        //L.tileLayer('https://wmts20.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg', {attribution: '<a title="Swiss Federal Office of Topography" href="https://www.swisstopo.admin.ch/">swisstopo</a>'})
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',{attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'})
      ]
    });

    // set bounds
    var southWest = L.latLng(44.40,3.95);
    var northEast = L.latLng(48.55,13.06);
    var bounds = L.latLngBounds(southWest, northEast);
    this.map.setMaxBounds(bounds);

    if ('setMap' in this.props) {
      this.sendMap(this.map);
    }
  }

  componentDidUpdate(prevProps, prevState){
    this.plotGeoJSON(this.props);
    this.plotPolygons(this.props);
    this.plotMarkers(this.props);
  }

  showPolygonTemp = e => {
    this.props.setTemp(e.target.options.title);
  }

  showGeojsonTemp = e => {
    this.props.setTemp(e);
  }

  hideGeojsonTemp = () => {
    this.props.hideTemp();
  }

  plotPolygons = props => {
    if ('threeD' in props && props.colorbar[0] !== "") {
      // Remove old layers
      if ('polygons' in this){
        this.map.removeLayer(this.polygons);
      }

      var lakes = [];
      const findLake = (geo,lake) => {return geo.find(c => c.properties.name === lake.name)}
      for (var lake of props.threeD){
        // Plot polygons
        var polygons = [];
        let mintemp = props.colorbar[0];
        let maxtemp = props.colorbar[1];
        let GeoPopupFunction = props.popupfunction;
        for (var px of lake.data){
          var lakecolor = props.lakeColor(Gradient.colors,px["v"],mintemp,maxtemp)
          polygons.push(L.polygon(px["g"], {color: lakecolor, fillColor: lakecolor, fillOpacity: 1,title:px["v"]})
                        .on({mouseover: this.showPolygonTemp}).on({mouseout: this.hideGeojsonTemp})
          );
        }
        var popup = findLake(props.geojson,lake);
        lakes.push(L.featureGroup(polygons).bindPopup(GeoPopupFunction(popup.properties)).addTo(this.map));
      }
      this.polygons = L.layerGroup(lakes);
      ReactDOM.findDOMNode(this.refs.loader).className = "map-loader hide";
    }
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
      ReactDOM.findDOMNode(this.refs.loader).className = "map-loader hide";
    }
  }

  plotGeoJSON = props => {
    if ('geojson' in props && 'popupfunction' in props && 'colorbar' in props && props.colorbar[0] !== "") {
      if ('geojson' in this){
        this.map.removeLayer(this.geojson);
      }
      let LakeColor = props.lakeColor;
      let GeoPopupFunction = props.popupfunction;
      let mintemp = props.colorbar[0];
      let maxtemp = props.colorbar[1];
      let geojson = {"type": "FeatureCollection", 
                     "name": "Swiss Lake Models", 
                     "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}}, 
                     "features": props.geojson };
      this.geojson = L.geoJSON(geojson, {
        style: layer => {
            var lakeTemp = layer.properties.surfacetemperature;
            var lakeColor = LakeColor(Gradient.colors,lakeTemp,mintemp,maxtemp);
            var fillopacity = 1;
            var opacity = 1;
            if (layer.properties.meteolakes !== "" || layer.properties.datalakes !== ""){
              fillopacity = 0;
              opacity = 0;
            }
            return {color: lakeColor, fillOpacity: fillopacity, opacity: opacity}
        }
    })
    .bindPopup(layer => {
        return GeoPopupFunction(layer.feature.properties)
    }).addTo(this.map);
    this.geojson.eachLayer(layer => {
      layer.on('mouseover',() => this.showGeojsonTemp(layer.feature.properties.surfacetemperature));
      layer.on('mouseout',this.hideGeojsonTemp);
    });
   ReactDOM.findDOMNode(this.refs.loader).className = "map-loader hide";
   }
  }

  render() {
    var help = "";
    if ('help' in this.props) { help = this.props.help };

    let helpContainer = "help-container";
    if(this.state.addClass) {
        helpContainer = "help-container show";
      }

    return <React.Fragment>
              <div id="map">
                <div ref="loader" className="map-loader"><div className="lds-dual-ring"></div></div>
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
               
                </div>
          </React.Fragment> 
  }
}

export default SwissTopoMap;