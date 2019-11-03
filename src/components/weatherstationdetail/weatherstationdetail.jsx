import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import SidebarLayout from '../sidebarlayout/sidebarlayout';
import { apiUrl } from '../../../config.json';
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
                            parameter={parameters[key]}
                            selected={this.props.selected}
                            select={this.props.select}
                    />})}
                </div>  
            );
        } else {return ""}
    }
}

class LiveParameter extends Component {
    render() { 
        var title = "See "+this.props.parameter.label+" timeseries";
        var paramClass = "parameter-block"
        if (this.props.selected.label === this.props.parameter.label){
            paramClass = "parameter-block selected"
        }
        return ( 
           <div className={paramClass} title={title} onClick={() => this.props.select(this.props.parameter)}>
               <div className="value">{this.props.parameter.value}</div>
               <div className="units">{this.props.parameter.units}</div>
               <div className="label">{this.props.parameter.label}</div>
           </div> 
        );
    }
}

class WeatherStationRight extends Component {
    render() {
        var link = this.props.selected.link;
        if ('time' in this.props.data){
            return ( 
                <div className="timeseries">
                    <div>{this.props.data.update}</div>
                    <div>Last Updated: {this.props.data.time}</div>
                    <div className="graph-container"></div>
                    <a href={link}>
                        <div className="view-download">View and Dowload Timeseries Data</div>
                    </a>
                </div>
             );
        } else {return ""}         
    }
}
 
class WeatherStationDetail extends Component {
    state = {
        dataset: [],
        error: false,
        selected: []
    }

    setSelectedState = selected => {
        this.setState({ selected});
    }

    async componentDidMount(){
        const url = this.props.location.pathname.split('/').slice(-1)[0];
        const { data: dataset } = await axios.get(apiUrl+'/api/lakestations/'+url).catch(error => {
            this.setState({ error: true});
          });
        const selected = dataset.parameters[Object.keys(dataset.parameters)[0]];
        this.setState({ dataset, selected })
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
                        left={<LiveParameterSummary data={this.state.dataset} selected={this.state.selected} select={this.setSelectedState}/>} 
                        right={<WeatherStationRight data={this.state.dataset} selected={this.state.selected}/>}
                    />
                </React.Fragment>
            );
        }            
    }
}
 
export default WeatherStationDetail;