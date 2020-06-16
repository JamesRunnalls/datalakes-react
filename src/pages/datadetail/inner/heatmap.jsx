import React, { Component } from "react";
import * as d3 from "d3";
import SliderDouble from "../../../components/sliders/sliderdouble";
import SliderSingle from "../../../components/sliders/slidersingle";
import SidebarLayout from "../../../format/sidebarlayout/sidebarlayout";
import DataSelect from "../../../components/dataselect/dataselect";
import FilterBox from "../../../components/filterbox/filterbox";
import D3HeatMap from "../../../graphs/d3/heatmap/heatmap";
import ColorManipulation from "../../../components/colormanipulation/colormanipulation";
import LoadDataSets from "../../../components/loaddatasets/loaddatasets";
import colorlist from "../../../components/colorramp/colors";
import "../datadetail.css";

class DisplayOptions extends Component {
  state = {
    colors: this.props.colors,
    title: this.props.title,
    bcolor: this.props.bcolor,
    minvalue: this.props.minvalue,
    maxvalue: this.props.maxvalue,
  };
  onChangeLocalColors = (colors) => {
    this.setState({ colors });
  };
  onChangeLocalTitle = (event) => {
    var title = event.target.value;
    this.setState({ title });
  };
  onChangeLocalMin = (event) => {
    var minvalue = event.target.value;
    this.setState({ minvalue });
  };
  onChangeLocalMax = (event) => {
    var maxvalue = event.target.value;
    this.setState({ maxvalue });
  };
  onChangeLocalBcolor = (event) => {
    var bcolor = event.target.value;
    this.setState({ bcolor });
  };
  updatePlot = () => {
    this.props.onChange(this.state);
  };
  componentDidUpdate(prevProps) {
    if (
      prevProps.title !== this.props.title ||
      prevProps.colors !== this.props.colors ||
      prevProps.minvalue !== this.props.minvalue ||
      prevProps.maxvalue !== this.props.maxvalue
    ) {
      var { colors, title, bcolor, minvalue, maxvalue } = this.props;
      this.setState({ colors, title, bcolor, minvalue, maxvalue });
    }
  }
  render() {
    var { colors, title, bcolor, minvalue, maxvalue } = this.state;
    return (
      <FilterBox
        title="Display Options"
        content={
          <React.Fragment>
            <table className="colors-table">
              <tbody>
                <tr>
                  <td>Title</td>
                  <td colSpan="2">
                    <textarea
                      id="title"
                      defaultValue={title}
                      onChange={this.onChangeLocalTitle}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Background</td>
                  <td>
                    <input
                      type="color"
                      id="bcolor"
                      defaultValue={bcolor}
                      onChange={this.onChangeLocalBcolor}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Maximum</td>
                  <td>
                    <input
                      type="number"
                      id="maxvalue"
                      value={maxvalue}
                      onChange={this.onChangeLocalMax}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Minimum</td>
                  <td>
                    <input
                      type="number"
                      id="minvalue"
                      value={minvalue}
                      onChange={this.onChangeLocalMin}
                    />
                  </td>
                </tr>
              </tbody>
            </table>

            <ColorManipulation
              onChange={this.onChangeLocalColors}
              colors={colors}
            />
            <div className="editsettings-button">
              <button
                type="button"
                title="Update mapplot settings"
                onClick={this.updatePlot}
              >
                Update Plot
              </button>
            </div>
          </React.Fragment>
        }
      />
    );
  }
}

class HeatMap extends Component {
  state = {
    colors: [
      { color: "#0000ff", point: 0 },
      { color: "#ff0000", point: 1 },
    ],
    title: "",
    bcolor: "#ffffff",
    xaxis: "x",
    yaxis: "y",
    zaxis: "z",
    xlabel: "None",
    ylabel: "None",
    zlabel: "None",
    xunits: "None",
    yunits: "None",
    zunits: "None",
    minvalue: false,
    maxvalue: false,
    download: false,
  };

  onChangeBcolor = (event) => {
    var bcolor = event.hex;
    this.setState({ bcolor });
  };

  onChangeDisplay = (newState) => {
    this.setState(newState);
  };

  handleAxisSelect = (axis) => (event) => {
    var { datasetparameters, data, file } = this.props;
    var {
      xlabel,
      ylabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      minvalue,
      maxvalue,
    } = this.state;
    var parameter = datasetparameters.find((x) => x.axis === event.value);
    if (axis === "yaxis") {
      ylabel = parameter.name;
      yunits = parameter.unit;
    } else if (axis === "xaxis") {
      xlabel = parameter.name;
      xunits = parameter.unit;
    } else if (axis === "zaxis") {
      zlabel = parameter.name;
      zunits = parameter.unit;
      var zdomain = d3.extent(
        [].concat.apply([], data[file][parameter.axis]).filter((f) => {
          return !isNaN(parseFloat(f)) && isFinite(f);
        })
      );
      minvalue = zdomain[0];
      maxvalue = zdomain[1];
    }
    this.setState({
      ylabel,
      xlabel,
      zlabel,
      yunits,
      xunits,
      zunits,
      minvalue,
      maxvalue,
      [axis]: event.value,
    });
  };

  isNumeric = (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };

  parseColor = (colorname) => {
    var defaultColors = [
      { color: "#0000ff", point: 0 },
      { color: "#ff0000", point: 1 },
    ];
    var colorparse = colorlist.find((c) => c.name === colorname);
    if (colorparse) {
      return colorparse.data;
    } else {
      return defaultColors;
    }
  };

  formatDate = (raw) => {
    return new Date(raw * 1000);
  };

  setDefault = () => {
    var { datasetparameters, dataset, getLabel, data, file } = this.props;
    var { xaxis, yaxis, zaxis } = this.state;

    // Get axis labels and units
    const xparam = datasetparameters.find((x) => x.axis === xaxis);
    const yparam = datasetparameters.find((y) => y.axis === yaxis);
    const zparam = datasetparameters.find((z) => z.axis === zaxis);
    var xlabel = getLabel("parameters", xparam.parameters_id, "name");
    var ylabel = getLabel("parameters", yparam.parameters_id, "name");
    var zlabel = getLabel("parameters", zparam.parameters_id, "name");
    var xunits = xparam.unit;
    var yunits = yparam.unit;
    var zunits = zparam.unit;
    const title = dataset.title;
    var colors = this.parseColor(dataset.plotproperties.colors);
    var zdomain = d3.extent(
      [].concat.apply([], data[file].z).filter((f) => {
        return !isNaN(parseFloat(f)) && isFinite(f);
      })
    );
    var minvalue = zdomain[0];
    var maxvalue = zdomain[1];

    this.setState({
      title,
      xlabel,
      ylabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      colors,
      minvalue,
      maxvalue,
    });
  };

  datetimeFilter = (data, lower, upper, min, max) => {
    if ((lower !== min && lower !== "") || (upper !== max && upper !== "")) {
      if (Array.isArray(data)) {
        var dataout = [];
        for (var i = 0; i < data.length; i++) {
          dataout.push(this.sliceArray(data[i], lower, upper));
        }
        return dataout;
      } else {
        return this.sliceArray(data, lower, upper);
      }
    } else {
      return data;
    }
  };

  sliceArray = (data, lower, upper) => {
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
    var y = data.y;

    var z = [];
    for (var j = 0; j < data.y.length; j++) {
      z.push(data.z[j].slice(l, u));
    }
    return { x: x, y: y, z: z };
  };

  componentDidMount() {
    this.setDefault();
    document.addEventListener("keydown", this.handleKeyDown);
  }

  render() {
    var {
      onChangeTime,
      onChangeFile,
      onChangeFileInt,
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
    } = this.props;
    const {
      bcolor,
      xaxis,
      yaxis,
      zaxis,
      title,
      xlabel,
      ylabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      colors,
      minvalue,
      maxvalue,
    } = this.state;

    // Show time slider or multiple files
    var time = datasetparameters.filter((p) => p.parameters_id === 1);
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
    var xoptions = [];
    var yoptions = [];
    var zoptions = [];
    for (var j = 0; j < datasetparameters.length; j++) {
      if (datasetparameters[j]["axis"].includes("x")) {
        xoptions.push({
          value: datasetparameters[j]["axis"],
          label: getLabel("parameters", datasetparameters[j]["parameters_id"], "name"),
        });
      } else if (datasetparameters[j]["axis"].includes("y")) {
        yoptions.push({
          value: datasetparameters[j]["axis"],
          label: getLabel("parameters", datasetparameters[j]["parameters_id"], "name"),
        });
      } else if (datasetparameters[j]["axis"].includes("z")) {
        zoptions.push({
          value: datasetparameters[j]["axis"],
          label: getLabel("parameters", datasetparameters[j]["parameters_id"], "name"),
        });
      }
    }

    if (!loading) {
      // Get data
      var plotdata;
      if (files[file].connect === "join") {
        if (Array.isArray(combined)) {
          plotdata = [];
          for (var k = 0; k < combined.length; k++) {
            plotdata.push({
              x: combined[k][xaxis],
              y: combined[k][yaxis],
              z: combined[k][zaxis],
            });
          }
        } else {
          plotdata = {
            x: combined[xaxis],
            y: combined[yaxis],
            z: combined[zaxis],
          };
        }
      } else if (files[file].connect === "ind") {
        plotdata = {
          x: data[file][xaxis],
          y: data[file][yaxis],
          z: data[file][zaxis],
        };
      } else {
        plotdata = { x: data[0][xaxis], y: data[0][yaxis], z: data[0][zaxis] };
      }

      if (timeSlider) {
        plotdata = this.datetimeFilter(plotdata, lower, upper, min, max);
      }

      // Format data
      if (Array.isArray(plotdata)) {
        for (var i = 0; i < plotdata.length; i++) {
          var { x, y, z } = plotdata[i];
          if (xlabel === "Time") x = x.map((i) => this.formatDate(i));
          if (ylabel === "Time") y = y.map((i) => this.formatDate(i));
          if (xlabel === "Depth") x = x.map((i) => -i);
          if (ylabel === "Depth") y = y.map((i) => -i);
          plotdata[i] = { x, y, z };
        }
      } else {
        ({ x, y, z } = plotdata);
        if (xlabel === "Time") x = x.map((i) => this.formatDate(i));
        if (ylabel === "Time") y = y.map((i) => this.formatDate(i));
        if (xlabel === "Depth") x = x.map((i) => -i);
        if (ylabel === "Depth") y = y.map((i) => -i);
        plotdata = { x, y, z };
      }

      // Value
      var value = new Date(files[file].ave);
    }

    return (
      <React.Fragment>
        <SidebarLayout
          sidebartitle="Plot Controls"
          left={
            <div className="detailgraph">
              <D3HeatMap
                data={plotdata}
                title={title}
                xlabel={xlabel}
                ylabel={ylabel}
                zlabel={zlabel}
                xunits={xunits}
                yunits={yunits}
                zunits={zunits}
                bcolor={bcolor}
                colors={colors}
                minvalue={minvalue}
                maxvalue={maxvalue}
              />
            </div>
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
                <div>
                  z:{" "}
                  <div className="axis-select">
                    <DataSelect
                      value="value"
                      label="label"
                      dataList={zoptions}
                      defaultValue={zaxis}
                      onChange={this.handleAxisSelect("zaxis")}
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
              <DisplayOptions
                colors={colors}
                title={title}
                bcolor={bcolor}
                minvalue={minvalue}
                maxvalue={maxvalue}
                onChange={this.onChangeDisplay}
              />
              <FilterBox
                title="Download"
                content={
                  <button
                    id="heatmap-download"
                    className="download-button"
                    onClick={this.download}
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

export default HeatMap;
