import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import SwissTopoMap from '../swisstopomap/swisstopomap';
import SidebarLayout from '../sidebarlayout/sidebarlayout';
import ModelList from '../modellist/modellist';
import './prediction.css';

class Predictions extends Component {
    state = {
        geojson : [],
        meteolakes : [],
        map : "",
        search: "",
        MinTemp: "",
        MaxTemp: "",
        Temp: ""
    }

    async componentDidMount(){
        // Lake Models
        const { data: geojson } = await axios.get('http://localhost:4000/api/lakemodels');

        // Simstrat Data
        try {
            const { data: simstratSurfaceTemperature } = await axios.get('http://localhost:4000/api/simstratsurfacetemperature');
            var temp = [];

            const simfind = (sim,lake) => {return sim.find(c => c.urlID === lake.properties.simstrat)}
            
            for (var lake of geojson){
                var laketemp = simfind(simstratSurfaceTemperature,lake);
                lake.properties.surfacetemperature = parseFloat(laketemp.surfacetemperature);
                temp.push(parseFloat(laketemp.surfacetemperature));
            }

            var MinTemp = Math.floor(Math.min(...temp));
            var MaxTemp = Math.ceil(Math.max(...temp));
            this.setState({ geojson, MinTemp, MaxTemp });
        } catch (e) {
            console.log(e);
            this.setState({ geojson });
        }
        
        // Meteolakes Data
        try {
            const { data: meteolakes } = await axios.get('http://localhost:4000/api/meteolakessurfacetemperature');
            this.setState({ meteolakes });
        } catch (e) {
            console.log(e);
        }  
    }

    isNumeric = (n) => {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }

    setMinTemp = event => {
        const MinTemp = parseFloat(event.target.value);
        if (this.isNumeric(MinTemp) && MinTemp > -5){
            this.setState({ MinTemp });
        }
    }

    setTemp = Temp => {
        ReactDOM.findDOMNode(this.refs.hoverTemp).innerHTML = Math.round(parseFloat(Temp) * 100) / 100 + "°C";
    }

    setMaxTemp = event => {
        const MaxTemp = parseFloat(event.target.value);
        if (this.isNumeric(MaxTemp) && MaxTemp < 40){
            this.setState({ MaxTemp });
        }
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

    lakeColor = (gradient,temp,mintemp,maxtemp) => {
        var lakecolor = "";
        if (temp > maxtemp){
            lakecolor = "#000000";
        } else if (temp < mintemp){
            lakecolor = "#FFFFFF";
        } else {
            lakecolor = gradient[parseInt(gradient.length/((maxtemp-mintemp)/(temp-mintemp)),10)];
        }
        return lakecolor;
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
            document.title = "Predictions - Datalakes";

            // Filter lakes
            var lowercasedSearch = this.state.search.toLowerCase();
            var filteredData = this.state.geojson.filter(item => { return item.properties.name.toLowerCase().includes(lowercasedSearch) });

         return (
             <React.Fragment>
                 <h1>Model Predictions</h1>
                 <SidebarLayout 
                    sidebartitle="Lake Models" 
                    left={<React.Fragment>
                            <SwissTopoMap geojson={filteredData}
                                          popupfunction={ this.propertiesPopup } 
                                          lakeColor={ this.lakeColor } 
                                          colorbar={ [this.state.MinTemp,this.state.MaxTemp] }
                                          setMap={this.setMap}
                                          setTemp={this.setTemp}
                                          threeD={ this.state.meteolakes }
                                        />
                                <div id="colorbar"> 
                                    <div ref="hoverTemp" className="hoverTemp"></div>
                                    <div className="colorbar-inner">
                                        <input title="Edit minimum temperature" type="text" defaultValue={this.state.MinTemp} onBlur={this.setMinTemp}></input> °C 
                                        <div id="bar" title="Legend colorbar"></div> 
                                        <input title="Edit maximum temperature" type="text" defaultValue={this.state.MaxTemp} onBlur={this.setMaxTemp}></input> °C
                                    </div>
                                </div>
                            </React.Fragment>} 
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