import React, { Component } from "react";
import SliderDouble from "../../../components/sliders/sliderdouble";
import SliderSingle from "../../../components/sliders/slidersingle";
import SidebarLayout from "../../../format/sidebarlayout/sidebarlayout";
import D3LineGraph from "../../../graphs/d3/linegraph/linegraph";
import DataSelect from "../../../components/dataselect/dataselect";
import FilterBox from "../../../components/filterbox/filterbox";
import Loading from "../../../components/loading/loading";
import "../datadetail.css";

class LoadDataSets extends Component {
  downloadProgress = data => {
    var len = data.length;
    var count = 0;
    for (var i = 0; i < len; i++) {
      if (data[i] === 0) count++;
    }
    count = len - count;
    return count;
  };

  render() {
    var { downloadData, data } = this.props;
    var count = this.downloadProgress(data);

    return (
      <div className="loaddatasets">
        {count < data.length && (
          <div className="linegraph-file">
            {count} of {data.length} files in memory.
            <button className="read-button" onClick={() => downloadData()}>
              Preload full dataset
            </button>
          </div>
        )}
      </div>
    );
  }
}

class LineGraph extends Component {
  state = {
    lcolor: "black",
    lweight: "0.5",
    bcolor: "#ffffff",
    xaxis: "x",
    yaxis: "y",
    title: "NoPlot",
    xlabel: "None",
    ylabel: "None",
    xscale: "Linear",
    yscale: "Linear",
    xunits: "None",
    yunits: "None",
    download: false
  };

  formatDate = raw => {
    return new Date(raw * 1000);
  };

  update = () => {
    var lcolor = document.getElementById("lcolor").value;
    var lweight = document.getElementById("lweight").value;
    var bcolor = document.getElementById("bcolor").value;
    var title = document.getElementById("title").value;
    var xscale = document.getElementById("xscale").value;
    var yscale = document.getElementById("yscale").value;
    this.setState({ lcolor, lweight, bcolor, title, xscale, yscale });
  };

  reset = () => {
    this.setDefault();
  };

  handleAxisSelect = axis => event => {
    var { parameters } = this.props;
    var { xlabel, ylabel, xunits, yunits } = this.state;
    var parameter = parameters.find(x => x.axis === event.value);
    console.log(parameter);
    if (axis === "yaxis") {
      ylabel = parameter.name;
      yunits = parameter.unit;
    } else if (axis === "xaxis") {
      xlabel = parameter.name;
      xunits = parameter.unit;
    }
    this.setState({ ylabel, xlabel, yunits, xunits, [axis]: event.value });
  };

  datetimeFilter = (data, lower, upper, min, max) => {
    if ((lower !== min && lower !== "") || (upper !== max && upper !== "")) {
      var l = 0;
      var u = data.x.length - 1;
      for (var i = 0; i < data.x.length; i++) {
        if (data.x[i] < lower) {
          l = i;
        }
        if (data.x[i] > upper && u === data.x.length - 1) {
          u = i;
        }
      }
      var x = data.x.slice(l, u);
      var y = data.y.slice(l, u);
      return { x: x, y: y };
    } else {
      return data;
    }
  };

  downloadGraph = () => {};

  setDownloadGraph = newFunc => {
    this.downloadGraph = newFunc;
  };

  handleKeyDown = event => {
    var { file, onChangeFileInt } = this.props;
    if (event.keyCode === 37) {
      // Left
      onChangeFileInt([file + 1]);
    } else if (event.keyCode === 39) {
      // right
      onChangeFileInt([file - 1]);
    }
  };

  setDefault = () => {
    var { parameters, dataset, getLabel } = this.props;
    var { xaxis, yaxis } = this.state;

    // Get axis labels and units
    const xparam = parameters.find(x => x.axis === xaxis);
    const yparam = parameters.find(y => y.axis === yaxis);
    var xlabel = getLabel("parameters", xparam.parameters_id, "name");
    var ylabel = getLabel("parameters", yparam.parameters_id, "name");
    var xunits = xparam.unit;
    var yunits = yparam.unit;
    const title = dataset.title;

    // Set initial axis scale
    var xscale = "Linear";
    var yscale = "Linear";
    if (xlabel === "Time") xscale = "Time";
    if (ylabel === "TIme") yscale = "Time";

    this.setState({
      title,
      xlabel,
      ylabel,
      xunits,
      yunits,
      yscale,
      xscale,
      lcolor: "#000000",
      lweight: "0.5",
      bcolor: "#ffffff"
    });
  };

  componentDidMount() {
    this.setDefault();
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    var {
      onChangeTime,
      onChangeFile,
      onChangeFileInt,
      onChangeLower,
      onChangeUpper,
      parameters,
      getLabel,
      data,
      lower,
      upper,
      max,
      min,
      files,
      file,
      downloadData,
      loading,
      combined
    } = this.props;
    const {
      lweight,
      bcolor,
      lcolor,
      xaxis,
      yaxis,
      title,
      xlabel,
      ylabel,
      xscale,
      yscale,
      xunits,
      yunits
    } = this.state;

    // Show time slider or multiple files
    var time = parameters.filter(p => p.parameters_id === 1);
    var timeSlider = false;
    var fileSlider = false;
    if (files.length > 1) {
      if (time.length > 0) {
        if (time[0].axis !== "M") {
          timeSlider = true;
        } else {
          fileSlider = true;
        }
      }
    }

    // Axis Options
    var xoptions = [];
    var yoptions = [];
    for (var j = 0; j < parameters.length; j++) {
      if (parameters[j]["axis"].includes("x")) {
        xoptions.push({
          value: parameters[j]["axis"],
          label: getLabel("parameters", parameters[j]["parameters_id"], "name")
        });
      } else if (parameters[j]["axis"].includes("y")) {
        yoptions.push({
          value: parameters[j]["axis"],
          label: getLabel("parameters", parameters[j]["parameters_id"], "name")
        });
      }
    }

    if (!loading) {
      // Get data
      var plotdata;
      if (files[file].connect === "join") {
        plotdata = { x: combined[xaxis], y: combined[yaxis] };
      } else if (files[file].connect === "ind") {
        plotdata = { x: data[file][xaxis], y: data[file][yaxis] };
      } else {
        plotdata = { x: data[0][xaxis], y: data[0][yaxis] };
      }

      if (timeSlider) {
        plotdata = this.datetimeFilter(plotdata, lower, upper, min, max);
      }

      // Format data
      var { x, y } = plotdata;
      if (xlabel === "Time") x = x.map(i => this.formatDate(i));
      if (ylabel === "Time") y = y.map(i => this.formatDate(i));
      if (xlabel === "Depth") x = x.map(i => -i);
      if (ylabel === "Depth") y = y.map(i => -i);
      plotdata = { x: x, y: y };

      // Value
      var value = this.formatDate(files[file].ave);
    }

    return (
      <React.Fragment>
        <SidebarLayout
          sidebartitle="Plot Controls"
          left={
            <React.Fragment>
              {loading ? (
                <table className="loading-table">
                  <tbody>
                    <tr>
                      <td>
                        <Loading />
                        <h3>Downloading Data</h3>
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <React.Fragment>
                  <div className="detaillinegraph">
                    <D3LineGraph
                      data={plotdata}
                      title={title}
                      xlabel={xlabel}
                      ylabel={ylabel}
                      xunits={xunits}
                      yunits={yunits}
                      lcolor={lcolor}
                      lweight={lweight}
                      bcolor={bcolor}
                      xscale={xscale}
                      yscale={yscale}
                      setDownloadGraph={this.setDownloadGraph}
                    />
                  </div>
                  <div className="linegraph-bottombox">
                    {fileSlider && (
                      <div className="linegraph-file">{value.toString()}</div>
                    )}
                  </div>
                </React.Fragment>
              )}
            </React.Fragment>
          }
          rightNoScroll={
            <React.Fragment>
              <div>
                <div>
                  x:{" "}
                  <div className="axis-select">
                    <DataSelect
                      value="value"
                      label="label"
                      dataList={xoptions}
                      defaultValue={xaxis}
                      onChange={this.handleAxisSelect("xaxis")}
                    />
                  </div>
                </div>
                <div>
                  y:{" "}
                  <div className="axis-select">
                    <DataSelect
                      value="value"
                      label="label"
                      dataList={yoptions}
                      defaultValue={yaxis}
                      onChange={this.handleAxisSelect("yaxis")}
                    />
                  </div>
                </div>
              </div>
              {fileSlider && (
                <FilterBox
                  title="Other Files"
                  preopen="true"
                  content={
                    <div className="">
                      <SliderSingle
                        onChange={onChangeFile}
                        onChangeFileInt={onChangeFileInt}
                        file={file}
                        value={value}
                        min={min}
                        max={max}
                        files={files}
                        type="time"
                      />
                      <LoadDataSets data={data} downloadData={downloadData} />
                    </div>
                  }
                />
              )}
              {timeSlider && (
                <FilterBox
                  title="Date Range"
                  preopen="true"
                  content={
                    <div className="side-date-slider">
                      <SliderDouble
                        onChange={onChangeTime}
                        onChangeLower={onChangeLower}
                        onChangeUpper={onChangeUpper}
                        min={min}
                        max={max}
                        lower={lower}
                        upper={upper}
                        files={files}
                      />
                      <LoadDataSets data={data} downloadData={downloadData} />
                    </div>
                  }
                />
              )}
              <FilterBox
                title="Display Options"
                content={
                  <div>
                    <table className="colors-table">
                      <tbody>
                        <tr>
                          <td>Title</td>
                          <td colSpan="2">
                            <textarea
                              id="title"
                              defaultValue={title}
                            ></textarea>
                          </td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>Color</td>
                          <td>Weight</td>
                        </tr>
                        <tr>
                          <td>Line</td>
                          <td>
                            <input
                              type="color"
                              id="lcolor"
                              defaultValue={lcolor}
                            />
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
                            <input
                              type="color"
                              id="bcolor"
                              defaultValue={bcolor}
                            />
                          </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>X Scale</td>
                          <td colSpan="2">
                            <select
                              id="xscale"
                              defaultValue={xscale}
                              className="scale-select"
                            >
                              <option value="Time">Time</option>
                              <option value="Linear">Linear</option>
                              <option value="Log">Logarithmic</option>
                            </select>
                          </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td>Y Scale</td>
                          <td colSpan="2">
                            <select
                              id="yscale"
                              defaultValue={yscale}
                              className="scale-select"
                            >
                              <option value="Time">Time</option>
                              <option value="Linear">Linear</option>
                              <option value="Log">Logarithmic</option>
                            </select>
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
                  </div>
                }
              />
              <FilterBox
                title="Download"
                content={
                  <button
                    id="linegraph-download"
                    className="download-button"
                    onClick={() => this.downloadGraph()}
                  >
                    Download as PNG
                  </button>
                }
              />
            </React.Fragment>
          }
          //open="False"
        />
      </React.Fragment>
    );
  }
}

export default LineGraph;
