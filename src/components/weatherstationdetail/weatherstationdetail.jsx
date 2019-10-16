import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import SidebarLayout from '../sidebarlayout/sidebarlayout';
import './weatherstationdetail.css';

class LiveParameterSummary extends Component {
    render() { 
        if ('parameters' in this.props.data){
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
        } else {return ""}
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
        if ('time' in this.props.data){
            return ( 
                <React.Fragment>
                    <div>Last Updated: {this.props.data.time}</div>
                    <div className="graph-container"></div>
                </React.Fragment>
             );
        } else {return ""}         
    }
}
 
class WeatherStationDetail extends Component {
    state = {
        dataset: [],
        error: false
    }

    async componentDidMount(){
        const url = this.props.location.pathname.split('/').slice(-1)[0];
        const { data: dataset } = await axios.get('http://localhost:4000/api/lakestations/'+url).catch(error => {
            this.setState({ error: true});
          });
        this.setState({ dataset })
    }

    render() {
        if (this.state.error) {
            return (
                <Redirect to="/live" />
            ); 
        } else {
            document.title = this.state.dataset.name+" Weather Station - Datalakes";
            return (
                <React.Fragment>
                    <h1>{this.state.dataset.name} Weather Station</h1>
                    <SidebarLayout 
                        sidebartitle="Time Series" 
                        left={<LiveParameterSummary data={this.state.dataset}/>} 
                        right={<WeatherStationRight data={this.state.dataset}/>}
                    />
                </React.Fragment>
            );
        }            
    }
}
 
export default WeatherStationDetail;