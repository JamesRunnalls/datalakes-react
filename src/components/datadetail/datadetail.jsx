import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";
import DateSlider from "../dateslider/dateslider";
import SidebarLayout from "../sidebarlayout/sidebarlayout";
import D3HeatMap from "../heatmap/heatmap";
import D3LineGraph from "../linegraph/linegraph";
import ColorSelect from "../colorselect/colorselect";
import Sensor from "./img/sensor.svg";
import Database from "./img/data.svg";
import Python from "./img/python.svg";
import R from "./img/r.svg";
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
    const { onChange, state } = this.props;
    const { data } = this.props.state;
    const { bcolor, sgradient, egradient, minz, maxz } = this.state;
    const graphtype = "time",
      xlabel = "",
      ylabel = "Depth",
      zlabel = "Temperature",
      xunits = "",
      yunits = "m",
      zunits = "°C";
    return (
      <React.Fragment>
        <SidebarLayout
          sidebartitle="Plot Controls"
          left={
            <D3HeatMap
              data={data}
              graphtype={graphtype}
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
                <DateSlider onChange={onChange} state={state} />
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
    const { onChange, state } = this.props;
    const { data } = this.props.state;
    const { lweight, bcolor, lcolor } = this.state;
    return (
      <React.Fragment>
        <SidebarLayout
          sidebartitle="Plot Controls"
          left={
            <D3LineGraph
              data={data}
              graphtype="time"
              xunits=""
              xlabel=""
              yunits="°C"
              ylabel="Temperature"
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
                <DateSlider onChange={onChange} state={state} />
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
  state = {};
  render() {
    return (
      <React.Fragment>
        <div>
          Data is stored in NetCDF format and is flattened for this preview.
        </div>
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
          <DateSlider onChange={onChange} state={state} />
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
  state = {};
  render() {
    return (
      <div className="pipeline">
        <div>
          See the <a href="">Renku Repository</a> for full details on
          reproducibility or click on the icons below to be directed to data and
          scripts stored in our <a href="">Gitlab Repository</a>.
        </div>
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
            <img src={heat} className="subnav-img" />
            <div className="subnav-text">Heat Map</div>
          </div>
          <div
            title="Preview data as a line graph"
            className={menu["linegraph"][0]}
            onClick={() => updateSelectedState("linegraph")}
          >
            <img src={line} className="subnav-img" />
            <div className="subnav-text">Line Graph</div>
          </div>
          <div
            title="Preview data as a table"
            className={menu["preview"][0]}
            onClick={() => updateSelectedState("preview")}
          >
            <img src={preview} className="subnav-img" />
            <div className="subnav-text">Preview</div>
          </div>
          <div
            title="Download data"
            className={menu["download"][0]}
            onClick={() => updateSelectedState("download")}
          >
            <img src={download} className="subnav-img" />
            <div className="subnav-text">Download</div>
          </div>
          <div
            title="See the data lineage"
            className={menu["pipeline"][0]}
            onClick={() => updateSelectedState("pipeline")}
          >
            <img src={pipe} className="subnav-img" />
            <div className="subnav-text">Pipeline</div>
          </div>
          <div
            title="See meta data for dataset"
            className={menu["information"][0]}
            onClick={() => updateSelectedState("information")}
          >
            <img src={info} className="subnav-img" />
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
    min: new Date("2019-06-12"),
    max: new Date("2019-12-12"),
    lower: new Date("2019-08-12"),
    upper: new Date("2019-10-12")
  };

  onChange = values => {
    const lower = values[0];
    const upper = values[1];
    this.setState({ lower, upper });
  };

  async componentDidMount() {
    const url = this.props.location.pathname.split("/").slice(-1)[0];
    const { data: dataset } = await axios
      .get("http://localhost:4000/api/datasets/" + url)
      .catch(error => {
        this.setState({ error: true });
      });
    this.setState({ dataset });

    const { data } = await axios
      .get("http://localhost:4000/api/data/json/" + url)
      .catch(error => {
        this.setState({ error: true });
      });
    this.setState({ data });
  }

  updateSelectedState = selected => {
    this.setState({ selection: selected });
  };

  render() {
    const { selection, dataset, error } = this.state;
    document.title = dataset.label + " - Datalakes";
    var inner = "";
    var menu = {
      heatmap: ["subnav-item hide",<HeatMap onChange={this.onChange} state={this.state}  />],
      linegraph: ["subnav-item hide",<LineGraph onChange={this.onChange} state={this.state} />],
      preview: ["subnav-item",<Preview />],
      download: ["subnav-item",<Download dataset={dataset} onChange={this.onChange} state={this.state}/>],
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
