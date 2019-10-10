import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './modellist.css';

class ModelInfo extends Component {

    sendPanInfo = (geometry) => {
        var lat = [];
        var lon = [];
        for (var x of geometry[0]){
            lat.push(x[1]);
            lon.push(x[0]);
        }
        var zoom = [[Math.max.apply(Math, lat),Math.min.apply(Math, lon)],[Math.min.apply(Math, lat),Math.max.apply(Math, lon)]];
        var latc = Math.min.apply(Math, lat) + ((Math.max.apply(Math, lat) - Math.min.apply(Math, lat)) / 2);
        var lonc = Math.min.apply(Math, lon) + ((Math.max.apply(Math, lon) - Math.min.apply(Math, lon)) / 2);
        this.props.panTo([latc, lonc],zoom);
      }

    render() { 
        var datalakes = "model";
        var meteolakes = "model";
        var simstrat = "model";
        if (this.props.datalakes === ""){datalakes = "model hide";} 
        if (this.props.meteolakes === ""){meteolakes = "model hide";} 
        if (this.props.simstrat === ""){simstrat = "model hide";}
         return (
             <div className="modellist">
                 <div className="top" onClick={ () => this.sendPanInfo(this.props.geometry)} title={"Pan to "+this.props.name}>
                    <div className="lakeTitle"><h4>{this.props.name}</h4></div>
                    <div>
                        <div>Surface Temperature: { this.props.surfacetemperature } °C</div>
                    </div>
                </div>
                <ul> 
                    <li className={ datalakes }><Link to={this.props.datalakes}>Five Day Forecast (Datalakes)</Link></li>
                    <li className={ meteolakes }><a href={this.props.meteolakes}>Three Day Forecast (Meteolakes)</a></li>
                    <li className={ simstrat }><a href={this.props.simstrat}>1D Lake Simulation (Simstrat)</a></li>
                </ul>
            </div>
        );
    }
}

class ModelList extends Component {
    render() { 
          return ( 
            <React.Fragment>
                { this.props.geojson.map(data => <ModelInfo key={data.properties.id} 
                                                            name={data.properties.name} 
                                                            elevation={data.properties.elevation} 
                                                            depth={data.properties.depth}
                                                            surfacetemperature={data.properties.surfacetemperature}
                                                            simstrat={data.properties.simstrat}
                                                            meteolakes={data.properties.meteolakes}
                                                            datalakes={data.properties.datalakes}
                                                            panTo={this.props.panTo}
                                                            geometry={data.geometry.coordinates}
                                                            />) }
            </React.Fragment>
        );
    }
}
 
export default ModelList;