import React, { Component } from "react";
import DateSliderDouble from "../../../components/sliders/datesliderdouble";
import SliderSingle from "../../../components/sliders/slidersingle";
import SidebarLayout from "../../../format/sidebarlayout/sidebarlayout";
import D3LineGraph from "../../../graphs/d3/linegraph/linegraph";
import DataSelect from "../../../components/dataselect/dataselect";
import FilterBox from "../../../components/filterbox/filterbox";
import "../datadetail.css";

class LoadDataSets extends Component {
  state = {};
  render() {
    var { downloadNumber, files, downloadData } = this.props;
    return (
      <div>
        {downloadNumber === 0 && files.length > 1 && (
          <div className="linegraph-file">
            {Math.round(100 / files.length).toString()}% of the dataset in
            memory.
            <button className="read-button" onClick={() => downloadData()}>
              Read in full dataset
            </button>
          </div>
        )}
        {downloadNumber !== files.length && downloadNumber !== 0 && (
          <div className="linegraph-downloading">
            {Math.round((downloadNumber * 100) / files.length).toString()}% of
            the dataset in memory.
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

  componentDidMount() {
    var { dataset } = this.props;
    this.setState({ title: dataset.title });
  }

  formatDate = raw => {
    return new Date(raw * 1000);
  };

  render() {
    var {
      onChangeTime,
      onChangeFile,
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
      downloadNumber,
      downloadData
    } = this.props;
    const { lweight, bcolor, lcolor, xaxis, yaxis, title } = this.state;

    // Axis Options
    const xoptions = [];
    const yoptions = [];
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

    // Get data for selected options
    var plotdata = { x: data[file][xaxis], y: data[file][yaxis] };

    // Datetime filter
    plotdata = this.datetimeFilter(plotdata, lower, upper, min, max);

    // Get axis labels
    const xparam = parameters.find(x => x.axis === xaxis);
    const yparam = parameters.find(y => y.axis === yaxis);
    const xlabel = getLabel("parameters", xparam.parameters_id),
      ylabel = getLabel("parameters", yparam.parameters_id),
      xunits = xparam.unit,
      yunits = yparam.unit;

    return (
      <React.Fragment>
        <SidebarLayout
          sidebartitle="Plot Controls"
          left={
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
                {data.length > 1 && (
                  <div className="linegraph-file">
                    {this.formatDate(files[file].value).toString()};
                  </div>
                )}
              </div>
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
                        value={file}
                        min={min}
                        max={max}
                        arr={files}
                        type="time"
                        filedict={filedict}
                      />
                      <LoadDataSets
                        downloadNumber={downloadNumber}
                        files={files}
                        downloadData={downloadData}
                      />
                    </div>
                  }
                />
              )}
              {timeSlider && (
                <FilterBox
                  title="Date Range"
                  content={
                    <div className="side-date-slider">
                      <DateSliderDouble
                        onChange={onChangeTime}
                        onChangeLower={onChangeLower}
                        onChangeUpper={onChangeUpper}
                        min={min}
                        max={max}
                        lower={lower}
                        upper={upper}
                      />
                      <LoadDataSets
                        downloadNumber={downloadNumber}
                        files={files}
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
          open="False"
        />
      </React.Fragment>
    );
  }
}

export default LineGraph;
