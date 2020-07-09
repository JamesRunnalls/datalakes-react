import React, { Component } from "react";
import * as d3 from "d3";
import SliderDouble from "../../../components/sliders/sliderdouble";
import SliderSingle from "../../../components/sliders/slidersingle";
import SidebarLayout from "../../../format/sidebarlayout/sidebarlayout";
import D3LineGraph from "../../../graphs/d3/linegraph/linegraph";
import DataSelect from "../../../components/dataselect/dataselect";
import FilterBox from "../../../components/filterbox/filterbox";
import Loading from "../../../components/loading/loading";
import LoadDataSets from "../../../components/loaddatasets/loaddatasets";
import "../datadetail.css";

class LineGraph extends Component {
  state = {
    lcolor: ["black"],
    lweight: ["0.5"],
    bcolor: "#ffffff",
    xaxis: "x",
    yaxis: "y",
    title: "",
    xlabel: "None",
    ylabel: "None",
    xscale: "Linear",
    yscale: "Linear",
    xunits: "None",
    yunits: "None",
    download: false,
    downsample: "None",
    mask: true,
  };

  formatDate = (raw) => {
    return new Date(raw * 1000);
  };

  update = () => {
    var bcolor = document.getElementById("bcolor").value;
    var title = document.getElementById("title").value;
    var xscale = document.getElementById("xscale").value;
    var yscale = document.getElementById("yscale").value;
    var downsample = document.getElementById("downsample").value;
    this.setState({
      bcolor,
      title,
      xscale,
      yscale,
      downsample,
    });
  };

  reset = () => {
    this.setDefault();
  };

  handleAxisSelect = (axis) => (event) => {
    var { datasetparameters } = this.props;
    var { xlabel, ylabel, xunits, yunits } = this.state;
    var parameter = datasetparameters.find((x) => x.axis === event.value);
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

  setDownloadGraph = (newFunc) => {
    this.downloadGraph = newFunc;
  };

  handleKeyDown = (event) => {
    var { file, onChangeFileInt } = this.props;
    var currentfile = file[file.length - 1];
    if (event.keyCode === 37) {
      // Left
      onChangeFileInt(parseInt(currentfile) + 1);
    } else if (event.keyCode === 39) {
      // right
      onChangeFileInt(parseInt(currentfile) - 1);
    }
  };

  setDefault = () => {
    var { datasetparameters, dataset, getLabel } = this.props;
    var { xaxis, yaxis } = this.state;

    // Get axis labels and units
    const xparam = datasetparameters.find((x) => x.axis === xaxis);
    const yparam = datasetparameters.find((y) => y.axis === yaxis);
    var xlabel = getLabel("parameters", xparam.parameters_id, "name");
    var ylabel = getLabel("parameters", yparam.parameters_id, "name");
    var downsample = "None";
    var xunits = xparam.unit;
    var yunits = yparam.unit;
    const title = dataset.title;

    // Set initial axis scale
    var xscale = "Linear";
    var yscale = "Linear";
    if (xlabel === "Time") {
      document.getElementById("xscale").value = "Time";
      xscale = "Time";
    }
    if (ylabel === "Time") {
      document.getElementById("yscale").value = "Time";
      yscale = "Time";
    }

    // Colors and weights
    var lcolor = Array.from({ length: 20 }).map((x) => this.getRandomColor());
    lcolor.unshift("#000000");
    var lweight = Array.from({ length: 20 }).map((x) => "1");

    this.setState({
      title,
      xlabel,
      ylabel,
      xunits,
      yunits,
      yscale,
      xscale,
      lcolor,
      lweight,
      downsample,
      bcolor: "#ffffff",
    });
  };

  findLink = (parameters, link) => {
    return parameters.find((p) => p.id === link);
  };

  toggleMask = () => {
    this.setState({ mask: !this.state.mask });
  };

  getRandomColor = () => {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  maskAxis = (dataset, xaxis, yaxis, mxaxis, myaxis, mask) => {
    if (mask) {
      var x = [];
      var y = [];
      var m = 0;
      for (var i = 0; i < dataset[xaxis].length; i++) {
        m = 0;
        if (dataset[mxaxis]) {
          m = Math.max(m, dataset[mxaxis][i]);
        }
        if (dataset[myaxis]) {
          m = Math.max(m, dataset[myaxis][i]);
        }
        if (m === 0) {
          x.push(dataset[xaxis][i]);
          y.push(dataset[yaxis][i]);
        }
      }
      return { x, y };
    } else {
      return { x: dataset[xaxis], y: dataset[yaxis] };
    }
  };

  downsample = (xx, yy, sample) => {
    var x, y, t, ds;
    var arr = {};
    if (["Daily", "Monthly"].includes(sample)) {
      for (var i = 0; i < xx.length; i++) {
        t = xx[i];
        if (sample === "Monthly") t.setDate(0);
        t.setHours(0);
        t.setMinutes(0);
        t.setSeconds(0);
        t.setMilliseconds(0);
        ds = t.toDateString();
        if (Object.keys(arr).includes(ds)) {
          arr[ds].push(yy[i]);
        } else {
          arr[ds] = [yy[i]];
        }
      }
      Object.keys(arr).forEach((key) => {
        arr[key] = d3.mean(arr[key]);
      });
      y = Object.values(arr);
      x = Object.keys(arr);
      x = x.map((dt) => new Date(dt));
    } else {
      x = xx;
      y = yy;
    }
    return { x, y };
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
      removeFile,
      toggleAddNewFile,
      onChangeLower,
      onChangeUpper,
      datasetparameters,
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
      combined,
      addnewfiles,
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
      yunits,
      mask,
      downsample,
    } = this.state;

    // Default no legend and no filecontrol
    var legend = false;
    var filecontrol = false;

    // Show time slider or multiple files
    var time = datasetparameters.filter((p) => p.parameters_id === 1);
    var timeSlider = false;
    var fileSlider = false;
    if (xlabel === "Time") timeSlider = true;
    if (files.length > 1 && time.length > 0 && time[0].axis === "M") {
      fileSlider = true;
    }

    // Axis Options
    var xoptions = [];
    var yoptions = [];
    var parent;
    for (var j = 0; j < datasetparameters.length; j++) {
      var detail = datasetparameters[j]["detail"];
      if (["none", null, "null"].includes(detail)) {
        detail = "";
      } else {
        detail = ` (${detail})`;
      }
      if (datasetparameters[j]["axis"].includes("x")) {
        if (Number.isInteger(datasetparameters[j]["link"])) {
          parent = this.findLink(
            datasetparameters,
            datasetparameters[j]["link"]
          );
          xoptions.push({
            value: datasetparameters[j]["axis"],
            label:
              getLabel(
                "parameters",
                datasetparameters[j]["parameters_id"],
                "name"
              ) +
              " (" +
              getLabel("parameters", parent["parameters_id"], "name") +
              ")",
          });
        } else {
          xoptions.push({
            value: datasetparameters[j]["axis"],
            label:
              getLabel(
                "parameters",
                datasetparameters[j]["parameters_id"],
                "name"
              ) + detail,
          });
        }
      } else if (datasetparameters[j]["axis"].includes("y")) {
        if (Number.isInteger(datasetparameters[j]["link"])) {
          parent = this.findLink(
            datasetparameters,
            datasetparameters[j]["link"]
          );
          yoptions.push({
            value: datasetparameters[j]["axis"],
            label:
              getLabel(
                "parameters",
                datasetparameters[j]["parameters_id"],
                "name"
              ) +
              " (" +
              getLabel("parameters", parent["parameters_id"], "name") +
              ")",
          });
        } else {
          yoptions.push({
            value: datasetparameters[j]["axis"],
            label:
              getLabel(
                "parameters",
                datasetparameters[j]["parameters_id"],
                "name"
              ) + detail,
          });
        }
      }
    }

    if (!loading) {
      // Error masks && confidence intervals
      var showmask = false;
      var mxaxis = null;
      var xupper = false;
      var xlower = false;
      var xp = datasetparameters.find((p) => p.axis === xaxis);
      var xpm = datasetparameters.filter(
        (p) => p.link === xp.id && p.parameters_id === 27
      );
      var xpcu = datasetparameters.filter(
        (p) => p.link === xp.id && p.parameters_id === 29
      );
      var xpcl = datasetparameters.filter(
        (p) => p.link === xp.id && p.parameters_id === 30
      );
      if (xpm.length === 1) {
        mxaxis = xpm[0].axis;
        showmask = true;
      } else if (xpcu.length === 1) {
        xupper = true;
      } else if (xpcl.length === 1) {
        xlower = true;
      }
      var myaxis = null;
      var yupper = false;
      var ylower = false;
      var yp = datasetparameters.find((p) => p.axis === yaxis);
      var ypm = datasetparameters.filter(
        (p) => p.link === yp.id && p.parameters_id === 27
      );
      var ypcu = datasetparameters.filter(
        (p) => p.link === yp.id && p.parameters_id === 29
      );
      var ypcl = datasetparameters.filter(
        (p) => p.link === yp.id && p.parameters_id === 30
      );
      if (ypm.length === 1) {
        myaxis = ypm[0].axis;
        showmask = true;
      } else if (ypcu.length === 1) {
        yupper = true;
      } else if (ypcl.length === 1) {
        ylower = true;
      }

      var dataset = [];
      if (fileSlider) {
        for (var f = 0; f < file.length; f++) {
          dataset.push(data[file[f]]);
        }
      } else {
        if (timeSlider) {
          dataset = [combined];
        } else {
          dataset = [data[0]];
        }
      }

      if (fileSlider) {
        legend = [];
        filecontrol = [];
      }
      var confidence = [];
      for (var d = 0; d < dataset.length; d++) {
        // Data masking
        dataset[d] = this.maskAxis(
          dataset[d],
          xaxis,
          yaxis,
          mxaxis,
          myaxis,
          mask
        );

        // Time range
        if (timeSlider) {
          dataset[d] = this.datetimeFilter(dataset[d], lower, upper, min, max);
        }

        // Format data && downsample
        var { x, y } = dataset[d];
        if (xlabel === "Time") x = x.map((i) => this.formatDate(i));
        if (ylabel === "Time") y = y.map((i) => this.formatDate(i));
        if (xlabel === "Depth") x = x.map((i) => -i);
        if (ylabel === "Depth") y = y.map((i) => -i);
        var out = { x, y };
        if (xlabel === "Time") out = this.downsample(x, y, downsample);
        dataset[d] = out;

        // Confidence
        var CI_upper, CI_lower;
        if (xupper || xlower) {
          CI_upper = xupper ? dataset[d][xpcu[0].axis] : dataset[d].x;
          CI_lower = xlower ? dataset[d][xpcl[0].axis] : dataset[d].x;
          confidence[d] = {
            axis: "x",
            CI_upper,
            CI_lower,
          };
        } else if (yupper || ylower) {
          CI_upper = yupper ? dataset[d][ypcu[0].axis] : dataset[d].y;
          CI_lower = ylower ? dataset[d][ypcl[0].axis] : dataset[d].y;
          confidence[d] = {
            axis: "y",
            CI_upper,
            CI_lower,
          };
        } else {
          confidence[d] = false;
        }

        if (fileSlider) {
          var value = new Date(files[file[d]].ave);
          var text = value.toDateString() + " " + value.toLocaleTimeString();
          var color = lcolor[d];
          legend.push({ color, text });
          filecontrol.push(
            <tr key={"file" + d}>
              <td>
                <input type="color" value={color} />
              </td>
              <td>{text}</td>
              <td
                id={d}
                onClick={removeFile}
                title="Remove"
                className="removefile"
              >
                ✕
              </td>
            </tr>
          );
        }
      }
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
                  <div className="detailgraph">
                    <D3LineGraph
                      data={dataset}
                      legend={legend}
                      confidence={confidence}
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
                </React.Fragment>
              )}
            </React.Fragment>
          }
          rightNoScroll={
            <React.Fragment>
              <FilterBox
                title="Axis"
                preopen="true"
                content={
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
                }
              />
              {fileSlider && (
                <FilterBox
                  title="Files"
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
                      <div className="keeplines">
                        Keep previously plotted line{" "}
                        <input
                          checked={addnewfiles}
                          type="checkbox"
                          onChange={toggleAddNewFile}
                        />
                      </div>
                      <table className="filecontrol">
                        <tbody>{filecontrol}</tbody>
                      </table>
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
                          <td>
                            <textarea
                              id="title"
                              defaultValue={title}
                            ></textarea>
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
                        </tr>
                        <tr>
                          <td>X Scale</td>
                          <td>
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
                          <td>
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
                        {timeSlider && (
                          <tr>
                            <td>Downsampling</td>
                            <td>
                              <select
                                id="downsample"
                                defaultValue={downsample}
                                className="scale-select"
                              >
                                <option value="None">None</option>
                                <option value="Daily">Daily</option>
                                <option value="Monthly">Monthly</option>
                              </select>
                            </td>
                            <td></td>
                          </tr>
                        )}
                        {showmask && (
                          <tr>
                            <td>Show Masked Points</td>
                            <td>
                              <input
                                type="checkbox"
                                checked={!mask}
                                onChange={this.toggleMask}
                              />
                            </td>
                          </tr>
                        )}
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
