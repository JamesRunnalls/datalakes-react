import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";
import * as d3 from "d3";
import DateSlider from "../../components/dateslider/dateslider";
import SidebarLayout from "../../format/sidebarlayout/sidebarlayout";
import D3HeatMap from "../../graphs/heatmap/heatmap";
import D3LineGraph from "../../graphs/linegraph/linegraph";
import { apiUrl } from '../../../config.json';
import Sensor from "./img/sensor.svg";
import Database from "./img/data.svg";
import Python from "./img/python.svg";
//import R from "./img/r.svg";
import heat from "./img/heat.svg";
import line from "./img/line.svg";
import preview from "./img/preview.svg";
import download from "./img/download.svg";
import pipe from "./img/pipe.svg";
import info from "./img/info.svg";
import "./datadetail.css";

class HeatMap extends Component {
  state = {
    bcolor: "#ffffff",
    sgradient: "#0000ff",
    egradient: "#ff0000",
    minz: "",
    maxz: ""
  };
  onChangeBcolor = event => {
    var bcolor = event.hex;
    this.setState({ bcolor });
  };

  update = () => {
    var sgradient = document.getElementById("sgradient").value;
    var egradient = document.getElementById("egradient").value;
    var minz = document.getElementById("minz").value;
    var maxz = document.getElementById("maxz").value;
    var bcolor = document.getElementById("bcolor").value;
    this.setState({ sgradient, egradient, minz, maxz, bcolor });
  };

  reset = () => {
    this.setState({
      bcolor: "#ffffff",
      sgradient: "#0000ff",
      egradient: "#ff0000",
      minz: "",
      maxz: ""
    });
    document.getElementById("maxz").value = "";
    document.getElementById("minz").value = "";
  };

  isNumeric = n => {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };

  render() {
    var { onChange, dataset, data, lower, upper, max, min } = this.props;
    if ((lower !== min && lower !== "") || (upper !== max && upper !== "")){
      var l = 0;
      var u = data.x.length - 1;
      for (var i = 0; i < data.x.length; i++){
          if (data.x[i] < lower){l = i}
          if (data.x[i] > upper && u == data.x.length - 1){u = i}
      }
      var x = data.x.slice(l,u);
      var y = data.y;
      var z = [];
      for (var zl of data.z){
        z.push(zl.slice(l,u))
      }
      data = {x: x, y: y, z:z};
    }
    const { units, axis } = dataset;
    const { bcolor, sgradient, egradient, minz, maxz } = this.state;
    const xlabel = axis.x,
      ylabel = axis.y,
      zlabel = axis.z,
      xunits = units.x,
      yunits = units.y,
      zunits = units.z;
    return (
      <React.Fragment>
        <SidebarLayout
          sidebartitle="Plot Controls"
          left={
            <D3HeatMap
              data={data}
              xlabel={xlabel}
              ylabel={ylabel}
              zlabel={zlabel}
              xunits={xunits}
              yunits={yunits}
              zunits={zunits}
              bcolor={bcolor}
              sgradient={sgradient}
              egradient={egradient}
              minz={minz}
              maxz={maxz}
            />
          }
          right={
            <React.Fragment>
              <div className="info-title" style={{ paddingTop: "0" }}>
                Set Date Range
              </div>
              <div className="side-date-slider">
                <DateSlider onChange={onChange} min={min} max={max} lower={lower} upper={upper}/>
              </div>
              <div className="info-title">Adjust Colors</div>
              <table className="colors-table">
                <tbody>
                  <tr>
                    <td></td>
                    <td></td>
                    <td>Color</td>
                    <td>Value ({zunits})</td>
                  </tr>
                  <tr>
                    <td rowSpan="2">Gradient</td>
                    <td>Max</td>
                    <td>
                      <input
                        type="color"
                        id="egradient"
                        defaultValue={egradient}
                      />
                    </td>
                    <td>
                      <input
                        id="maxz"
                        type="number"
                        className="color-value"
                      ></input>
                    </td>
                  </tr>
                  <tr>
                    <td>Min</td>
                    <td>
                      <input
                        type="color"
                        id="sgradient"
                        defaultValue={sgradient}
                      />
                    </td>
                    <td>
                      <input
                        id="minz"
                        type="number"
                        className="color-value"
                      ></input>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="2">Background</td>
                    <td>
                      <input type="color" id="bcolor" defaultValue={bcolor} />
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
              <div className="color-buttons">
                <button className="color-button" onClick={this.update}>
                  Update
                </button>
                <button className="color-button" onClick={this.reset}>
                  Reset
                </button>
              </div>

              <div className="info-title">Download Image</div>
              <button
                id="heatmap-download"
                className="download-button"
                onClick={this.download}
              >
                Download
              </button>
            </React.Fragment>
          }
          open="False"
        />
      </React.Fragment>
    );
  }
}

class LineGraph extends Component {
  state = {
    lcolor: "black",
    lweight: "0.5",
    bcolor: "#ffffff"
  };

  update = () => {
    var lcolor = document.getElementById("lcolor").value;
    var lweight = document.getElementById("lweight").value;
    var bcolor = document.getElementById("bcolor").value;
    this.setState({ lcolor, lweight, bcolor });
  };

  reset = () => {
    this.setState({
      lcolor: "black",
      lweight: "0.5",
      bcolor: "#ffffff"
    });
    document.getElementById("lweight").value = "";
  };

  render() {
    var { onChange, dataset, data, lower, upper, max, min } = this.props;
    if ((lower !== min && lower !== "") || (upper !== max && upper !== "")){
      var l = 0;
      var u = data.x.length - 1;
      for (var i = 0; i < data.x.length; i++){
          if (data.x[i] < lower){l = i}
          if (data.x[i] > upper && u == data.x.length - 1){u = i}
      }
      var x = data.x.slice(l,u);
      var y = data.y.slice(l,u);
      var z = [];
      data = {x: x, y: y};
    }
    const { units, axis } = dataset;
    const { lweight, bcolor, lcolor } = this.state;
    const xlabel = axis.x,
      ylabel = axis.y,
      xunits = units.x,
      yunits = units.y;
    return (
      <React.Fragment>
        <SidebarLayout
          sidebartitle="Plot Controls"
          left={
            <D3LineGraph
              data={data}
              xlabel={xlabel}
              ylabel={ylabel}
              xunits={xunits}
              yunits={yunits}
              sequential="x"
              lcolor={lcolor}
              lweight={lweight}
              bcolor={bcolor}
            />
          }
          right={
            <React.Fragment>
              <div className="info-title" style={{ paddingTop: "0" }}>
                Set Date Range
              </div>
              <div className="side-date-slider">
                <DateSlider onChange={onChange} min={min} max={max} lower={lower} upper={upper}/>
              </div>
              <div className="info-title">Adjust Colors</div>
              <table className="colors-table">
                <tbody>
                  <tr>
                    <td></td>
                    <td>Color</td>
                    <td>Weight</td>
                  </tr>
                  <tr>
                    <td>Line</td>
                    <td>
                      <input type="color" id="lcolor" defaultValue={lcolor} />
                    </td>
                    <td>
                      <input
                        id="lweight"
                        type="number"
                        className="color-value"
                        defaultValue={lweight}
                      ></input>
                    </td>
                  </tr>
                  <tr>
                    <td>Background</td>
                    <td>
                      <input type="color" id="bcolor" defaultValue={bcolor} />
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
              <div className="color-buttons">
                <button className="color-button" onClick={this.update}>
                  Update
                </button>
                <button className="color-button" onClick={this.reset}>
                  Reset
                </button>
              </div>

              <div className="info-title">Download Image</div>
              <button
                id="linegraph-download"
                className="download-button"
                onClick={this.download}
              >
                Download
              </button>
            </React.Fragment>
          }
          open="False"
        />
      </React.Fragment>
    );
  }
}

class Preview extends Component {
  render() {
    const { data, dataset } = this.props.state;
    var inner = [];
    var axis = [];
    var row;
    if (dataset.plot.includes("2D")){
      axis.push(<div key="xaxis">X-axis: {dataset.axis.x + " (" + dataset.units.x + ")"}</div>);
      axis.push(<div key="yaxis">Y-axis: {dataset.axis.y + " (" + dataset.units.y + ")"}</div>);
      axis.push(<div key="zaxis">Z-axis: {dataset.axis.z + " (" + dataset.units.z + ")"}</div>);
      row = [<td key="blank"> </td>];
      for (var k = 0; k < Math.min(10,data.x.length); k++){
        row.push(<th key={"h"+k}>{data.x[k]}</th>)
      }
      inner.push(<tr key="head">{row}</tr>);

      for (var i = 0; i < Math.min(200,data.y.length); i++){
        row = [<th key={"r"+i}>{data.y[i]}</th>];
        for (var j = 0; j < Math.min(10,data.x.length); j++){
          row.push(<td key={"r"+i+j}>{data.z[i][j]}</td>)
        }
        inner.push(<tr key={"k"+i}>{row}</tr>);
      }
    } else if (dataset.plot.includes("1D")){
      axis.push(<div key="xaxis">X-axis: {dataset.axis.x + " (" + dataset.units.x + ")"}</div>);
      axis.push(<div key="yaxis">Y-axis: {dataset.axis.y + " (" + dataset.units.y + ")"}</div>);
      inner = [<tr key="h"><th>x</th><th>y</th></tr>];
      for (var l = 0; l < Math.min(200,data.y.length); l++){
        inner.push(<tr key={"h"+l}><td>{data.x[l]}</td><td>{data.y[l]}</td></tr>)
      }
    }



    return (
      <React.Fragment>
        <div className="preview-flat">
          <b>Data is flattened for this preview.</b>
          {axis}
        </div>
        <div className="preview-table"> 
          <table>
            <tbody>
              {inner}
            </tbody>
          </table>
        </div>
      </React.Fragment>
    );
  }
}

class Download extends Component {
  render() {
    const { onChange, lower, upper, max, min, dataset, url, apiUrl } = this.props;
    const jsonUrl = apiUrl + "/api/data/json/" + url;
    const ncUrl = apiUrl + "/api/data/nc/" + url;
    const csvUrl = apiUrl + "/api/data/csv/" + url;
    const txtUrl = apiUrl + "/api/data/txt/" + url;
    return (
      <React.Fragment>
        <div className="info-title">Dataset Title</div>
        {dataset.label}

        <div className="info-title">Licence</div>
        {dataset.licence}

        <div className="info-title">Citations</div>
        {dataset.citation}

        <div className="info-title">Time Period</div>
        <div className="date-slider">
          <DateSlider onChange={onChange} min={min} max={max} lower={lower} upper={upper}/>
        </div>
        <div className="info-title">Download</div>
        <div className="MultipleDownload">
          <a><button title="Not Currently Available">.nc</button></a>
          <a href={csvUrl}><button title="Download datasets in CSV format">.csv</button></a>
          <a href={txtUrl}><button title="Download datasets in TXT format">.txt</button></a>
          <a href={jsonUrl}><button title="Download datasets in JSON format">.json</button></a>
        </div>
      </React.Fragment>
    );
  }
}

class Pipeline extends Component {
  state = {};
  render() {
    return (
      <div className="pipeline">
        <div>
          See the <a href="https://renkulab.io/gitlab/damien.bouffard/datalakes">Renku Repository</a> for full details on
          reproducibility or click on the icons below to be directed to data and
          scripts stored in our <a href="https://renkulab.io/gitlab/damien.bouffard/datalakes">Gitlab Repository</a>.
        </div>
        <div className="diagram">
          <a>
            <img src={Sensor} alt="Sensor" />
            <div className="">Sensor</div>
            <div>18.01.19</div>
          </a>
          <div className="separator full"></div>
          <a>
            <img src={Database} alt="Database" />
            <div className="">Level 0</div>
            <div>18.01.19</div>
          </a>
          <div className="separator half"></div>
          <a>
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
  state = {};
  render() {
    return (
      <React.Fragment>
        <div className="info-inner">
          <div className="info-title">Dataset Properties</div>
          <table>
            <tbody>
              {Object.keys(this.props.dataset.filters).map(prop => (
                <tr key={prop}>
                  <td>{prop}</td>
                  <td>{this.props.dataset.filters[prop]}</td>
                </tr>
              ))}
              {Object.keys(this.props.dataset.info).map(prop => (
                <tr key={prop}>
                  <td>{prop}</td>
                  <td>{this.props.dataset.info[prop]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="info-inner">
          <div className="info-title">Contact</div>
          <table>
            <tbody>
              {Object.keys(this.props.dataset.contact).map(prop => (
                <tr key={prop}>
                  <td>{prop}</td>
                  <td>{this.props.dataset.contact[prop]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="info-title">Companion Datasets</div>
          <table>
            <tbody>
              {Object.keys(this.props.dataset.companion).map(prop => (
                <tr key={prop}>
                  <td>
                    <a href={prop}>{this.props.dataset.companion[prop]}</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </React.Fragment>
    );
  }
}

class DataSubMenu extends Component {
  render() {
    const { menu, updateSelectedState } = this.props
    return (
      <React.Fragment>
        <div className="data-subnav">
          <div
            title="Preview data as a heat map"
            className={menu["heatmap"][0]}
            onClick={() => updateSelectedState("heatmap")}
          >
            <img src={heat} className="subnav-img" alt="Heatmap"/>
            <div className="subnav-text">Heat Map</div>
          </div>
          <div
            title="Preview data as a line graph"
            className={menu["linegraph"][0]}
            onClick={() => updateSelectedState("linegraph")}
          >
            <img src={line} className="subnav-img" alt="Line Graph"/>
            <div className="subnav-text">Line Graph</div>
          </div>
          <div
            title="Preview data as a table"
            className={menu["preview"][0]}
            onClick={() => updateSelectedState("preview")}
          >
            <img src={preview} className="subnav-img" alt="Preview"/>
            <div className="subnav-text">Preview</div>
          </div>
          <div
            title="Download data"
            className={menu["download"][0]}
            onClick={() => updateSelectedState("download")}
          >
            <img src={download} className="subnav-img" alt="Download"/>
            <div className="subnav-text">Download</div>
          </div>
          <div
            title="See the data lineage"
            className={menu["pipeline"][0]}
            onClick={() => updateSelectedState("pipeline")}
          >
            <img src={pipe} className="subnav-img" alt="Data Pipeline"/>
            <div className="subnav-text">Pipeline</div>
          </div>
          <div
            title="See meta data for dataset"
            className={menu["information"][0]}
            onClick={() => updateSelectedState("information")}
          >
            <img src={info} className="subnav-img" alt="Information"/>
            <div className="subnav-text">Information</div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

class DataDetail extends Component {
  state = {
    selection: "",
    dataset: [],
    error: false,
    min: "",
    max: "",
    lower: "",
    upper: "",
    data: ""
  };

  onChange = values => {
    const lower = values[0]/1000;
    const upper = values[1]/1000;
    if (Math.round(lower) !== Math.round(this.state.lower) || Math.round(upper) !== Math.round(this.state.upper)){
      this.setState({ lower, upper });
    }
  };

  async componentDidMount() {
    const url = this.props.location.pathname.split("/").slice(-1)[0];
    const { data: dataset } = await axios
      .get(apiUrl + "/api/datasets/" + url)
      .catch(error => {
        this.setState({ error: true });
      });
    const { data } = await axios
      .get(apiUrl + "/api/data/json/" + url)
      .catch(error => {
        this.setState({ error: true });
      });

    var xe = d3.extent(data.x),
    min = xe[0],
    max = xe[1],
    lower = xe[0],
    upper = xe[1];
    
    this.setState({ dataset, data, min, max, lower, upper });
  }

  updateSelectedState = selected => {
    this.setState({ selection: selected });
  };

  render() {
    const { selection, dataset, error, data, min, max, lower, upper } = this.state;
    document.title = dataset.label + " - Datalakes";
    const url = this.props.location.pathname.split("/").slice(-1)[0];
    var inner = "";
    var menu = {
      heatmap: ["subnav-item hide",<HeatMap onChange={this.onChange} dataset={dataset} data={data} lower={lower} upper={upper} max={max} min={min}/>],
      linegraph: ["subnav-item hide",<LineGraph onChange={this.onChange} dataset={dataset} data={data} lower={lower} upper={upper} max={max} min={min}/>],
      preview: ["subnav-item",<Preview state={this.state}/>],
      download: ["subnav-item",<Download dataset={dataset} onChange={this.onChange} lower={lower} upper={upper} max={max} min={min} url={url} apiUrl={apiUrl}/>],
      pipeline: ["subnav-item",<Pipeline />],
      information: ["subnav-item",<Information dataset={dataset} />]
    };
    if ("plot" in dataset){
      if (dataset.plot.includes("2D") && dataset.plot.includes("1D")){
        if (selection === ""){
          menu.heatmap[0] = "subnav-item active";
          inner = menu.heatmap[1];
        } else {
          menu.heatmap[0] = "subnav-item";
        }
        menu.linegraph[0] = "subnav-item";
      } else if (dataset.plot.includes("2D")){
        if (selection === ""){
          menu.heatmap[0] = "subnav-item active";
          inner = menu.heatmap[1];
        } else {
          menu.heatmap[0] = "subnav-item";
        }
      } else if (dataset.plot.includes("1D")){
        if (selection === ""){
          menu.linegraph[0] = "subnav-item active";
          inner = menu.linegraph[1];
        } else {
          menu.linegraph[0] = "subnav-item";
        }
      };
    }
    if (selection !== ""){
      menu[selection][0] = "subnav-item active"
      inner = menu[selection][1]
    } 
    if (error) {
      return <Redirect to="/dataportal" />;
    } else {
      return (
        <React.Fragment>
          <h1>{dataset.label}</h1>
          <DataSubMenu menu={menu} updateSelectedState={this.updateSelectedState} />
          {inner}
        </React.Fragment>
      );
    }
  }
}

export default DataDetail;