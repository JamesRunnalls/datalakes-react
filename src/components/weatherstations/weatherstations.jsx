import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './weatherstations.css';

class WeatherStation extends Component {
    render() { 
        var link = "/live/"+String(this.props.url);
         return (
             <div className="weatherstation" title="See live data">
                <Link to={link}>
                    <img alt={this.props.name} src={require('./img/'+this.props.imgname)} />
                    <h4>{this.props.name}</h4>
                    <div className="desc">{this.props.desc}</div>
                </Link>
            </div>
        );
    }
}

class WeatherStations extends Component {
    render() { 
          return ( 
            <React.Fragment>
                { this.props.datalist.map(data => <WeatherStation key={data.name} url={data.url} name={data.name} desc={data.description} imgname={data.imgname}/>) }
            </React.Fragment>
        );
    }
}
 
export default WeatherStations;