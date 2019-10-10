import React, { Component } from 'react';
import SwissTopoMap from '../swisstopomap/swisstopomap';
import WeatherStations from '../weatherstations/weatherstations';
import SidebarLayout from '../sidebarlayout/sidebarlayout';
import datalist from './livedata';
import meteoswiss from './meteoswiss';
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

class Live extends Component {
    constructor(props) {
        super(props);
        this.state = {addClass: false}
      }
      toggle() {
        this.setState({addClass: !this.state.addClass});
      }

    render() { 
        document.title = "Live - Datalakes";
        var center = [46.375, 6.535];
        var zoom = 9;

        var markers=[];
        for (var data of datalist){
            var marker = {
                "lon":data.lon,
                "lat":data.lat,
                "tooltip":'<a title="See live data" href="/live/'+data.url+'">'+String(data.name)+'<br>'+String(data.parameters.watertemperature.value)+"&deg;C</a>",
            }
            markers.push(marker);
        }
        for (data of meteoswiss){
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
                                        <SwissTopoMap markers={markers} zoom={zoom} center={center} tooltip={true}/>
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
                                right={<WeatherStations datalist={datalist}/>}/>
             </React.Fragment>
         
        );
    }
}
 
export default Live;