import React, { Component } from 'react';
import SwissTopoMap from '../swisstopomap/swisstopomap';
import SidebarLayout from '../sidebarlayout/sidebarlayout';
import ModelList from '../modellist/modellist';
import LakeData from './lakedata';
import './prediction.css';


class Predictions extends Component {
    state = {
        geojson : LakeData,
        map : "",
        search: ""
    }

    setMap = (map) => {
        this.setState({map: map});
    }

    panTo = (latlon,bounds) => {
        var zoom = this.state.map.getBoundsZoom(bounds)
        this.state.map.flyTo(latlon, zoom);
    }

    searchDatasets = event => {
        this.setState({ search: event.target.value });
      };

    propertiesPopup = prop => {
        var model = ""
        if (prop.datalakes !== ""){model = model + '<br><a href="'+prop.datalakes+'">Five Day Forecast (Datalakes)</a>';} 
        if (prop.meteolakes !== ""){model = model + '<br><a href="'+prop.meteolakes+'">Three Day Forecast (Meteolakes)</a>';} 
        if (prop.simstrat !== ""){model = model + '<br><a href="'+prop.simstrat+'">1D Lake Simulation (Simstrat)</a>';}
        return "<div> <b>"+prop.name+"</b><br> Elevation: "+prop.elevation+"m <br> Depth: "+prop.depth+"m <br> Surface Temperature: "+prop.surfacetemperature+"°C <b>"+model+"</b>"
    }

    lakeStyle = (gradient,prop,mintemp,maxtemp) => {
        var lakecolor = gradient[parseInt(gradient.length/((maxtemp-mintemp)/(prop.surfacetemperature-mintemp)),10)];
        var lakeopacity = 0.8;
        if (prop.meteolakes !== "" || prop.datalakes !== ""){
            lakeopacity = 0;
        }
        return {color: lakecolor, fillOpacity: lakeopacity};
    }

    keyPress = (e,data) => {
        if(e.keyCode === 13){
            var dataset = data.properties;
            if (dataset.datalakes !== ""){
                window.location.href = dataset.datalakes;
            } else if (dataset.meteolakes !== ""){
                window.location.href = dataset.meteolakes;
            } else if (dataset.simstrat !== ""){
                window.location.href = dataset.simstrat;
            }
        }
     }

    render() { 
            let MinTemp = 10;
            let MaxTemp = 25;
            document.title = "Predictions - Datalakes";

            // Filter lakes
            var lowercasedSearch = this.state.search.toLowerCase();
            var filteredData = this.state.geojson.filter(item => { return item.properties.name.toLowerCase().includes(lowercasedSearch) });

         return (
             <React.Fragment>
                 <h1>Model Predictions</h1>
                 <SidebarLayout 
                    sidebartitle="Lake Models" 
                    left={<SwissTopoMap geojson={filteredData} 
                                        popupfunction={ this.propertiesPopup } 
                                        geojsonstyle={ this.lakeStyle } 
                                        colorbar={ [MinTemp,MaxTemp] }
                                        setMap={this.setMap}
                                        />} 
                    right={<ModelList geojson={filteredData}
                                    panTo={ this.panTo }
                                    onSearch={this.searchDatasets}
                                    />}
                    rightNoScroll={<input onChange={this.searchDatasets} onKeyDown={(e) => this.keyPress(e,filteredData[0])} type="search" placeholder="Search" className="modelSearch"></input>}
                />
             </React.Fragment>
        );
    }
}
 
export default Predictions;