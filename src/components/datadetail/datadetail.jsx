import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import axios from 'axios';
import DateSlider from '../dateslider/dateslider';
import SidebarLayout from '../sidebarlayout/sidebarlayout';
import D3HeatMap from '../heatmap/heatmap';
import D3LineGraph from '../linegraph/linegraph';
import ColorSelect from '../colorselect/colorselect';
import Sensor from './img/sensor.svg';
import Database from './img/data.svg';
import Python from './img/python.svg';
import R from './img/r.svg';
import './data.css';

import datas from './data1.json';


class HeatMap extends Component {
    render() { 
        const { onChange, state } = this.props;
        return ( 
            <React.Fragment>
                <SidebarLayout 
                    sidebartitle="Plot Controls"
                    left={
                        <D3HeatMap />
                    }
                    right={
                        <React.Fragment>
                            <div className="info-title">Date Range</div>
                            <div className="side-date-slider">
                                <DateSlider onChange={onChange} state={state}/>
                            </div>
                        </React.Fragment>
                    }
                />
            </React.Fragment>
         );
    }
}

class LineGraph extends Component {
    state = {
        lcolor:"black",
        lweight:"0.5",
        bcolor:"none"
    }
    onChangeBcolor = (event) => {
        var bcolor = event.hex;
        this.setState({ bcolor })
        document.getElementById("bcolor").style.backgroundColor=bcolor;
    }
    onChangeLcolor = (event) => {
        var lcolor = event.hex;
        this.setState({ lcolor })
        document.getElementById("lcolor").style.backgroundColor=lcolor;
    }

    render() { 
        const { onChange, state } = this.props;
        return ( 
            <React.Fragment>
                <SidebarLayout 
                    sidebartitle="Plot Controls"
                    left={
                        <D3LineGraph 
                            data={datas} 
                            graphtype="time" 
                            xunits="" 
                            xlabel="" 
                            yunits="°C" 
                            ylabel="Temperature" 
                            sequential="x"
                            lcolor={this.state.lcolor}
                            lweight={this.state.lweight}
                            bcolor={this.state.bcolor}
                        />
                    }
                    right={
                        <React.Fragment>
                            <div className="info-title">Date Range</div>
                            <div className="side-date-slider">
                                <DateSlider onchange={onChange} state={state}/>
                            </div>
                            <div className="info-title">Background Color</div>
                                <ColorSelect id="bcolor" onchange={this.onChangeBcolor} defaultcolor="none" />
                            <div className="info-title">Line Color</div>
                                <ColorSelect id="lcolor" onchange={this.onChangeLcolor} defaultcolor="black" />
                        </React.Fragment>
                    }
                />
            </React.Fragment>
         );
    }
}
 
class Preview extends Component {
    state = {  }
    render() { 
        return ( 
            <React.Fragment>
                <div>Data is stored in NetCDF format and is flattened for this preview.</div>
            </React.Fragment>
          );
    }
}
 
class Download extends Component {
    render() { 
        const { onChange, state } = this.props;
        return ( 
            <React.Fragment>
                <div className="info-title">Dataset Title</div>
                {this.props.dataset.label}

                <div className="info-title">Licence</div>
                {this.props.dataset.licence}
                
                <div className="info-title">Citations</div>
                {this.props.dataset.citation}
                
                <div className="info-title">Time Period</div>
                <div className="date-slider">
                    <DateSlider onChange={onChange} state={state}/>
                </div>
                <div className="info-title">Download</div>
                <div className="MultipleDownload">
                    <button title="Download datasets in NetCDF format">.nc</button>
                    <button title="Download datasets in CSV format">.csv</button>
                    <button title="Download datasets in TXT format">.txt</button>
                </div>
            </React.Fragment>
          );
    }
}

class Pipeline extends Component {
    state = {  }
    render() { 
        return ( 
            <div className="pipeline">
                <div>See the <a href="">Renku Repository</a> for full details on reproducibility or click 
                on the icons below to be directed to data and scripts stored in our <a href="">Gitlab Repository</a>.</div>
                <div className="diagram">
                    <a>
                        <img src={Sensor} alt="Sensor" />
                        <div className="">Sensor</div>
                        <div>18.01.19</div>
                    </a>
                    <div className="separator full"></div>
                    <a href="">
                        <img src={Database} alt="Database" />
                        <div className="">Level 0</div>
                        <div>18.01.19</div>
                    </a>
                    <div className="separator half"></div>
                    <a href="">
                        <img src={Python} alt="Python" />
                        <div className="">Python</div>
                        <div>18.01.19</div>
                    </a>
                    <div className="separator half"></div>
                    <a>
                        <img src={Database} alt="Database" />
                        <div className="">Level 1</div>
                        <div>18.01.19</div>
                    </a>
                </div>
            </div>
        );
    }
}
 
class Information extends Component {
    state = {  }
    render() { 
        return ( 
            <React.Fragment>
                <div className="info-inner">
                    <div className="info-title">Dataset Properties</div>
                    <table>
                      <tbody>
                        { Object.keys(this.props.dataset.filters).map( prop => ( <tr key={prop}><td>{prop}</td><td>{this.props.dataset.filters[prop]}</td></tr> ))}
                        { Object.keys(this.props.dataset.info).map( prop => ( <tr key={prop}><td>{prop}</td><td>{this.props.dataset.info[prop]}</td></tr> ))}
                      </tbody>
                    </table>
                </div>
                <div className="info-inner">
                    <div className="info-title">Contact</div>
                    <table>
                      <tbody>
                        { Object.keys(this.props.dataset.contact).map( prop => ( <tr key={prop}><td>{prop}</td><td>{this.props.dataset.contact[prop]}</td></tr> ))}
                      </tbody>
                    </table>
                    <div className="info-title">Companion Datasets</div>
                    <table>
                      <tbody>
                        { Object.keys(this.props.dataset.companion).map( prop => ( <tr key={prop}><td><a href={prop}>{this.props.dataset.companion[prop]}</a></td></tr> ))}
                      </tbody>
                    </table>
                </div>


            </React.Fragment>
         );
    }
}

class DataDetail extends Component {
    state = {
        selection:"linegraph",
        dataset: [],
        error: false,
        min: new Date('2019-06-12'),
        max: new Date('2019-12-12'),
        lower: new Date('2019-08-12'),
        upper: new Date('2019-10-12')
    }

    onChange = values => {
        const lower = values[0];
        const upper = values[1];
        this.setState({ lower, upper });
      }

    async componentDidMount(){
        const url = this.props.location.pathname.split('/').slice(-1)[0];
        const { data: dataset } = await axios.get('http://localhost:4000/api/datasets/'+url).catch(error => {
            this.setState({ error: true});
          });
        this.setState({ dataset })
    }

    updateSelectedState = selected => {
        this.setState({selection:selected});
      };

    render() { 
        document.title = this.state.dataset.label+" - Datalakes";
        var classHeatMap = "subnav-item";
        var classLineGraph = "subnav-item";
        var classPreview = "subnav-item";
        var classDownload = "subnav-item";
        var classPipeline = "subnav-item";
        var classInformation = "subnav-item";
        var selected = "";
        if (this.state.selection === "heatmap"){selected = <HeatMap onChange={this.onChange} state={this.state}/>; classHeatMap = "subnav-item active"}
        if (this.state.selection === "linegraph"){selected = <LineGraph onChange={this.onChange} state={this.state}/>; classLineGraph = "subnav-item active"}
        if (this.state.selection === "preview"){selected = <Preview />; classPreview = "subnav-item active"}
        if (this.state.selection === "download"){selected = <Download dataset={this.state.dataset} onChange={this.onChange} state={this.state}/>; classDownload = "subnav-item active"}
        if (this.state.selection === "pipeline"){selected = <Pipeline />; classPipeline = "subnav-item active"}
        if (this.state.selection === "information"){selected = <Information dataset={this.state.dataset}/>; classInformation = "subnav-item active"}
        if (this.state.error) {
            return (
                <Redirect to="/dataportal" />
            );
        } else {
            return (
                <React.Fragment>
                    <h1>{this.state.dataset.label}</h1> 
                    <div className="subnav">
                        <div title="Preview data as a heat map" className={classHeatMap} onClick={() => this.updateSelectedState("heatmap")}>Heat Map</div>
                        <div title="Preview data as a line graph" className={classLineGraph} onClick={() => this.updateSelectedState("linegraph")}>Line Graph</div>
                        <div title="Preview data as a table" className={classPreview} onClick={() => this.updateSelectedState("preview")}>Preview</div>
                        <div title="Download data" className={classDownload} onClick={() => this.updateSelectedState("download")}>Download</div>
                        <div title="See the data lineage" className={classPipeline} onClick={() => this.updateSelectedState("pipeline")}>Pipeline</div>
                        <div title="See meta data for dataset" className={classInformation} onClick={() => this.updateSelectedState("information")}>Information</div>
                    </div>
                    {selected}           
                </React.Fragment>
           );
        }
    }
}
 
export default DataDetail;