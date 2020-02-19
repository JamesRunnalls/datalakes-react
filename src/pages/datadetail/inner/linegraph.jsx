import React, { Component } from "react";
import { mergeWith } from "lodash";
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
    if (count < len) {
      return `${count} of ${len} files in memory.`;
    } else {
      return "";
    }
  };

  render() {
    var { fullDataset, downloadData, data } = this.props;
    return (
      <div className="loaddatasets">
        {this.downloadProgress(data)}
        {!fullDataset && (
          <div className="linegraph-file">
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
    title: "test",
    download: false
  };

  formatDate = raw => {
    return new Date(raw * 1000);
  };

  getAve = arr => {
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length || 0;
  };

  combineTimeseries = arr => {
    var combinedArr = arr[0];
    for (var i = 1; i < arr.length; i++) {
      if (arr[i] !== 0){
        combinedArr = mergeWith(combinedArr, arr[i], this.customizer);
      }
    }
    return combinedArr;
  };

  customizer = (objValue, srcValue) => {
    return objValue.concat(srcValue);
  };

  update = () => {
    var lcolor = document.getElementById("lcolor").value;
    var lweight = document.getElementById("lweight").value;
    var bcolor = document.getElementById("bcolor").value;
    var title = document.getElementById("title").value;
    this.setState({ lcolor, lweight, bcolor, title });
  };

  reset = () => {
    this.setState({
      lcolor: "#000000",
      lweight: "0.5",
      bcolor: "#ffffff",
      title: ""
    });
    document.getElementById("lcolor").value = "#000000";
    document.getElementById("lweight").value = 0.5;
    document.getElementById("bcolor").value = "#ffffff";
    document.getElementById("title").value = "";
  };

  handleAxisSelect = axis => event => {
    this.setState({ [axis]: event.value });
  };

  datetimeFilter = (data, lower, upper, min, max) => {
    console.log(data)
    console.log(upper,lower)
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
      console.log(l,u)
      var x = data.x.slice(l, u);
      var y = data.y.slice(l, u);
      console.log(x,y)
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
    if (event.keyCode === 37){
      // Left
      onChangeFileInt([file + 1])
    } else if (event.keyCode === 39){
      // right
      onChangeFileInt([file - 1])
    }
  }

  componentDidMount() {
    var { dataset } = this.props;
    this.setState({ title: dataset.title });
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  formatDate = raw => {
    return new Date(raw * 1000);
  };

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
      filedict,
      fullDataset,
      downloadData,
      loading
    } = this.props;
    const { lweight, bcolor, lcolor, xaxis, yaxis, title } = this.state;

    var xoptions = [];
    var yoptions = [];
    var xlabel = "";
    var ylabel = "";
    var xunits = "";
    var yunits = "";

    // Show time slider or multiple files
    var time = parameters.filter(p => p.parameters_id === 1);
    var timeSlider = false;
    var fileSlider = false;
    if (time.length > 0) {
      if (time[0].axis !== "M") {
        timeSlider = true;
      } else {
        fileSlider = true;
      }
    }

    // Axis Options
    for (var j = 0; j < parameters.length; j++) {
      if (parameters[j]["axis"].includes("x")) {
        xoptions.push({
          value: parameters[j]["axis"],
          label: getLabel("parameters", parameters[j]["parameters_id"])
        });
      } else if (parameters[j]["axis"].includes("y")) {
        yoptions.push({
          value: parameters[j]["axis"],
          label: getLabel("parameters", parameters[j]["parameters_id"])
        });
      }
    }

    if (!loading) {

      // Get data
      var plotdata;
      if (files[file].connect === "join"){
        var combinedData = this.combineTimeseries(data);
        plotdata = { x: combinedData[xaxis], y: combinedData[yaxis] };
        plotdata = this.datetimeFilter(plotdata, lower, upper, min, max);
      } else if (files[file].connect === "ind") {
        plotdata = { x: data[file][xaxis], y: data[file][yaxis] };
      }

      // Get axis labels
      const xparam = parameters.find(x => x.axis === xaxis);
      const yparam = parameters.find(y => y.axis === yaxis);
      xlabel = getLabel("parameters", xparam.parameters_id);
      ylabel = getLabel("parameters", yparam.parameters_id);
      xunits = xparam.unit;
      yunits = yparam.unit;

      // Value
      var value = this.formatDate(filedict[file]);
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
                  <D3LineGraph
                    data={plotdata}
                    title={title}
                    xlabel={xlabel}
                    ylabel={ylabel}
                    xunits={xunits}
                    yunits={yunits}
                    sequential="x"
                    lcolor={lcolor}
                    lweight={lweight}
                    bcolor={bcolor}
                    setDownloadGraph={this.setDownloadGraph}
                  />
                  <div className="linegraph-bottombox">
                    <div className="linegraph-file">{value.toString()}</div>
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
                        arr={files}
                        filedict={filedict}
                        type="time"
                      />
                      <LoadDataSets
                        fullDataset={fullDataset}
                        data={data}
                        downloadData={downloadData}
                      />
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
                      />
                      <LoadDataSets
                        fullDataset={fullDataset}
                        data={data}
                        downloadData={downloadData}
                      />
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
