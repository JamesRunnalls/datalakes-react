import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import SidebarLayout from '../sidebarlayout/sidebarlayout';
import datalist from '../live/livedata';
import './weatherstationdetail.css';

class LiveParameterSummary extends Component {
    render() { 
        var parameters = this.props.data.parameters;
        return ( 
            <div className="live-parameter-container">
                { Object.keys(parameters).map( key => {
                    return <LiveParameter
                        key={key}
                        value={parameters[key].value}
                        units={parameters[key].units}
                        label={parameters[key].label}
                />})}
            </div>  
            );
    }
}

class LiveParameter extends Component {
    render() { 
        var title = "See "+this.props.label+" timeseries";
        return ( 
           <div className="parameter-block" title={title}>
               <div className="value">{this.props.value}</div>
               <div className="units">{this.props.units}</div>
               <div className="label">{this.props.label}</div>
           </div> 
        );
    }
}

class WeatherStationRight extends Component {
    render() { 
        return ( 
            <React.Fragment>
                <div>Last Updated: {this.props.data.time}</div>
                <div className="graph-container"></div>
            </React.Fragment>
         );
    }
}
 
class WeatherStationDetail extends Component {

    render() {
        var url = this.props.location.pathname;
        for (var data of datalist){
            if ("/live/"+data.url === url){;
                document.title = data.name+" Weather Station - Datalakes";
                return (
                    <React.Fragment>
                        <h1>{data.name} Weather Station</h1>
                        <SidebarLayout 
                            sidebartitle="Time Series" 
                            left={<LiveParameterSummary data={data}/>} 
                            right={<WeatherStationRight data={data}/>}
                        />
                    </React.Fragment>
                );
            }
        }
        return (
            <Redirect to="/live" />
        );            
    }
}
 
export default WeatherStationDetail;