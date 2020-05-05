import React, { Component } from "react";
import SidebarLayout from "../../../format/sidebarlayout/sidebarlayout";
import DataSelect from "../../../components/dataselect/dataselect";
import FilterBox from "../../../components/filterbox/filterbox";
import D3HeatMap from "../../../graphs/d3/heatmap/heatmap";
import "../datadetail.css";
import ColorManipulation from "../../../components/colormanipulation/colormanipulation";

class DisplayOptions extends Component {
  state = {
    gradient: this.props.gradient,
    title: this.props.title,
  };
  onChangeLocalGradient = (gradient) => {
    this.setState({ gradient });
  };
  updatePlot = () => {
    var { gradient, title } = this.state;
    this.props.onChange(gradient);
  };
  render() {
    var { gradient } = this.state;
    return (
      <FilterBox
        title="Display Options"
        content={
          <React.Fragment>
            <ColorManipulation
              onChange={this.onChangeLocalGradient}
              colors={gradient}
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
    gradient: [
      { color: "#0000ff", point: 0 },
      { color: "#ffffff", point: 0.5 },
      { color: "#ff0000", point: 1 },
    ],
    bcolor: "#ffffff",
    xaxis: "x",
    yaxis: "y",
    zaxis: "z",
    title: "",
    xlabel: "None",
    ylabel: "None",
    zlabel: "None",
    xunits: "None",
    yunits: "None",
    zunits: "None",
    download: false,
  };
  onChangeBcolor = (event) => {
    var bcolor = event.hex;
    this.setState({ bcolor });
  };

  onChangeGradient = (gradient) => {
    this.setState({ gradient });
  };

  handleAxisSelect = (axis) => (event) => {
    var { parameters } = this.props;
    var { xlabel, ylabel, zlabel, xunits, yunits, zunits } = this.state;
    var parameter = parameters.find((x) => x.axis === event.value);
    if (axis === "yaxis") {
      ylabel = parameter.name;
      yunits = parameter.unit;
    } else if (axis === "xaxis") {
      xlabel = parameter.name;
      xunits = parameter.unit;
    } else if (axis === "zaxis") {
      zlabel = parameter.name;
      zunits = parameter.unit;
    }
    this.setState({
      ylabel,
      xlabel,
      zlabel,
      yunits,
      xunits,
      zunits,
      [axis]: event.value,
    });
  };

  isNumeric = (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
  };

  formatDate = (raw) => {
    //return new Date(raw * 1000);
    return new Date((raw - 719529) * 24 * 60 * 60 * 1000);
  };

  setDefault = () => {
    var { parameters, dataset, getLabel } = this.props;
    var { xaxis, yaxis, zaxis } = this.state;

    // Get axis labels and units
    const xparam = parameters.find((x) => x.axis === xaxis);
    const yparam = parameters.find((y) => y.axis === yaxis);
    const zparam = parameters.find((z) => z.axis === zaxis);
    var xlabel = getLabel("parameters", xparam.parameters_id, "name");
    var ylabel = getLabel("parameters", yparam.parameters_id, "name");
    var zlabel = getLabel("parameters", zparam.parameters_id, "name");
    var xunits = xparam.unit;
    var yunits = yparam.unit;
    var zunits = zparam.unit;
    const title = dataset.title;

    this.setState({
      title,
      xlabel,
      ylabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      bcolor: "#ffffff",
    });
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
      gradient,
    } = this.state;

    // Show time slider or multiple files
    var time = parameters.filter((p) => p.parameters_id === 1);
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
    var zoptions = [];
    for (var j = 0; j < parameters.length; j++) {
      if (parameters[j]["axis"].includes("x")) {
        xoptions.push({
          value: parameters[j]["axis"],
          label: getLabel("parameters", parameters[j]["parameters_id"], "name"),
        });
      } else if (parameters[j]["axis"].includes("y")) {
        yoptions.push({
          value: parameters[j]["axis"],
          label: getLabel("parameters", parameters[j]["parameters_id"], "name"),
        });
      } else if (parameters[j]["axis"].includes("z")) {
        zoptions.push({
          value: parameters[j]["axis"],
          label: getLabel("parameters", parameters[j]["parameters_id"], "name"),
        });
      }
    }

    if (!loading) {
      // Get data
      var plotdata;
      if (files[file].connect === "join") {
        plotdata = {
          x: combined[xaxis],
          y: combined[yaxis],
          z: combined[zaxis],
        };
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
      var { x, y, z } = plotdata;
      if (xlabel === "Time") x = x.map((i) => this.formatDate(i));
      if (ylabel === "Time") y = y.map((i) => this.formatDate(i));
      if (xlabel === "Depth") x = x.map((i) => -i);
      if (ylabel === "Depth") y = y.map((i) => -i);
      plotdata = { x, y, z };
    }

    return (
      <React.Fragment>
        <SidebarLayout
          sidebartitle="Plot Controls"
          left={
            <div className="detailgraph">
              <D3HeatMap
                data={plotdata}
                xlabel={xlabel}
                ylabel={ylabel}
                zlabel={zlabel}
                xunits={xunits}
                yunits={yunits}
                zunits={zunits}
                bcolor={bcolor}
                gradient={gradient}
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
              <DisplayOptions
                gradient={gradient}
                onChange={this.onChangeGradient}
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
