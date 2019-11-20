import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SwissTopoMap from '../../graphs/leaflet/custommap';
import SidebarLayout from '../../format/sidebarlayout/sidebarlayout';
import { apiUrl } from '../../../config.json';
import DW from '../../../public/img/DW.svg';
import MW from '../../../public/img/MW.svg';
import MP from '../../../public/img/MP.svg';
import MC from '../../../public/img/MC.svg';
import FR from '../../../public/img/FR.svg';
import PW from '../../../public/img/PW.svg';
import PP from '../../../public/img/PP.svg';
import PR from '../../../public/img/PR.svg';
import PA from '../../../public/img/PA.svg';
import './live.css';

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

class Live extends Component {
    state = {
        addClass: false,
        meteoStations: [],
        lakeStations: []
    }

    async componentDidMount(){
        const { data: meteoStations } = await axios.get(apiUrl+'/api/meteostations');
        const { data: lakeStations } = await axios.get(apiUrl+'/api/lakestations');
        this.setState({ meteoStations, lakeStations });
    }
    
    toggle = () => {
        this.setState({addClass: !this.state.addClass});
    }

    render() { 
        document.title = "Live - Datalakes";
        var center = [46.375, 6.535];
        var zoom = 9;

        var markers=[];
        for (var data of this.state.lakeStations){
            var marker = {
                "lon":data.lon,
                "lat":data.lat,
                "tooltip":'<a title="See live data" href="/live/'+data.url+'">'+String(data.name)+'<br>'+String(data.parameters.watertemperature.value)+"&deg;C</a>",
            }
            markers.push(marker);
        }
        for (data of this.state.meteoStations){
            marker = {
                "lon":data.lon,
                "lat":data.lat,
                "popup":'<b>'+String(data.name)+'</b><br>'+data.type+'<br>Elevation: '+data.elevation+'mAOD<br><a target="_blank" href="'+data.link+'">See live data</a>',
                "icon":data.icon
            }
            markers.push(marker);
        }

        let legend = ["legend hide"];
        let legendsmall = ["legend-small"];
        if(this.state.addClass) {
            legend = ["legend"];
            legendsmall = ["legend-small hide"];
        }

         return ( 
             <React.Fragment>
                 <h1>Live Conditions</h1>
                 <SidebarLayout sidebartitle="Lake Weather Stations" 
                                left={<React.Fragment>
                                        <SwissTopoMap markers={markers} zoom={zoom} center={center}/>
                                        <div className={legend}>
                                            <div className="legend-top" title="Hide legend" onClick={this.toggle.bind(this)}>
                                                <h3>
                                                    <div className="legend-title">Legend</div>
                                                    <span>></span>
                                                </h3>
                                            </div>
                                            <div className="legend-block">
                                                <div className="legend-item"><img src={DW} alt="" /><div className="legend-text">Lake Weather Station</div></div>
                                                <div className="legend-item"><img src={FR} alt="" /><div className="legend-text">FOEN River Station</div></div>
                                                <div className="legend-item"><img src={PR} alt="" /><div className="legend-text">Partner Road Weather Station</div></div>
                                            </div>
                                            <div className="legend-block">
                                                <div className="legend-item"><img src={PW} alt="" /><div className="legend-text">Partner Weather Station</div></div>
                                                <div className="legend-item"><img src={PP} alt="" /><div className="legend-text">Partner Rain Gauge</div></div>
                                                <div className="legend-item"><img src={PA} alt="" /><div className="legend-text">Partner Agrometeoro Station</div></div>
                                            </div>
                                            <div className="legend-block">
                                                <div className="legend-item"><img src={MW} alt="" /><div className="legend-text">MeteoSwiss Weather Station</div></div>
                                                <div className="legend-item"><img src={MP} alt="" /><div className="legend-text">MeteoSwiss Rain Gauge</div></div>
                                                <div className="legend-item"><img src={MC} alt="" /><div className="legend-text">MeteoSwiss Webcam</div></div>
                                            </div>
                                        </div>
                                        <div className={legendsmall} onClick={this.toggle.bind(this)}>
                                            <div className="legend-top"  title="Show legend">
                                                <h3>
                                                    <div className="legend-title">Legend</div>
                                                    <span>></span>
                                                </h3>
                                            </div>
                                        </div>
                                      </React.Fragment>} 
                                right={<WeatherStations datalist={this.state.lakeStations}/>}/>
             </React.Fragment>
         
        );
    }
}
 
export default Live;