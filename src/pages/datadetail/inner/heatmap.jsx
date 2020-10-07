import React, { Component } from "react";
import * as d3 from "d3";
import SliderDouble from "../../../components/sliders/sliderdouble";
import SliderSingle from "../../../components/sliders/slidersingle";
import NumberSliderDouble from "../../../components/sliders/sliderdoublenumber";
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
    thresholdStep: this.props.thresholdStep,
  };
  onChangeLocalColors = (colors) => {
    this.setState({ colors });
  };
  onChangeLocalTitle = (event) => {
    var title = event.target.value;
    this.setState({ title });
  };
  onChangeLocalThreshold = (event) => {
    var thresholdStep = event.target.value;
    this.setState({ thresholdStep });
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
      prevProps.maxvalue !== this.props.maxvalue ||
      prevProps.thresholdStep !== this.props.thresholdStep
    ) {
      var {
        colors,
        title,
        bcolor,
        minvalue,
        maxvalue,
        thresholdStep,
      } = this.props;
      this.setState({
        colors,
        title,
        bcolor,
        minvalue,
        maxvalue,
        thresholdStep,
      });
    }
  }
  render() {
    var {
      colors,
      title,
      bcolor,
      minvalue,
      maxvalue,
      thresholdStep,
    } = this.state;
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
                <tr>
                  <td>Number of Thresholds</td>
                  <td>
                    <input
                      type="number"
                      id="threshold"
                      step="1"
                      value={thresholdStep}
                      onChange={this.onChangeLocalThreshold}
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

class HeatMapSidebar extends Component {
  render() {
    return (
      <React.Fragment>
        <div>
          <div>
            x:{" "}
            <div className="axis-select">
              <DataSelect
                value="value"
                label="label"
                dataList={this.props.xoptions}
                defaultValue={this.props.xaxis}
                onChange={this.props.handleAxisSelect("xaxis")}
              />
            </div>
          </div>
          <div>
            y:{" "}
            <div className="axis-select">
              <DataSelect
                value="value"
                label="label"
                dataList={this.props.yoptions}
                defaultValue={this.props.yaxis}
                onChange={this.props.handleAxisSelect("yaxis")}
              />
            </div>
          </div>
          <div>
            z:{" "}
            <div className="axis-select">
              <DataSelect
                value="value"
                label="label"
                dataList={this.props.zoptions}
                defaultValue={this.props.zaxis}
                onChange={this.props.handleAxisSelect("zaxis")}
              />
            </div>
          </div>
        </div>
        {this.props.fileSlider && (
          <FilterBox
            title="Other Files"
            preopen="true"
            content={
              <div className="">
                <SliderSingle
                  onChange={this.props.onChangeFile}
                  onChangeFileInt={this.props.onChangeFileInt}
                  file={this.props.file}
                  value={this.props.value}
                  min={this.props.min}
                  max={this.props.max}
                  files={this.props.files}
                  type="time"
                />
                <LoadDataSets
                  data={this.props.data}
                  downloadData={this.props.downloadData}
                />
              </div>
            }
          />
        )}
        {this.props.timeSlider && (
          <FilterBox
            title="Date Range"
            preopen="true"
            content={
              <div className="side-date-slider">
                <SliderDouble
                  onChange={this.props.onChangeTime}
                  onChangeLower={this.props.onChangeLower}
                  onChangeUpper={this.props.onChangeUpper}
                  min={this.props.min}
                  max={this.props.max}
                  lower={this.props.lower}
                  upper={this.props.upper}
                  files={this.props.files}
                />
                <LoadDataSets
                  data={this.props.data}
                  downloadData={this.props.downloadData}
                />
              </div>
            }
          />
        )}
        <FilterBox
          title={this.props.ylabel + " Range"}
          content={
            <div className="side-date-slider">
              <NumberSliderDouble
                onChange={this.props.onChangeY}
                min={this.props.minY}
                max={this.props.maxY}
                lower={this.props.lowerY}
                upper={this.props.upperY}
                unit={this.props.yunits}
              />
            </div>
          }
        />
        <DisplayOptions
          colors={this.props.colors}
          title={this.props.title}
          bcolor={this.props.bcolor}
          thresholdStep={this.props.thresholdStep}
          minvalue={this.props.minvalue}
          maxvalue={this.props.maxvalue}
          onChange={this.props.onChangeDisplay}
        />
      </React.Fragment>
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
    xlabel: "Time",
    ylabel: "None",
    zlabel: "None",
    xunits: "None",
    yunits: "None",
    zunits: "None",
    thresholdStep: 20,
    minvalue: false,
    maxvalue: false,
    download: false,
    upperY: 1,
    lowerY: 0,
    maxY: 1,
    minY: 0,
  };

  addGaps = (obj, gap) => {
    if (this.state.xlabel === "Time" && obj) {
      for (var i = 1; i < obj.x.length; i++) {
        if (
          obj.x[i].getTime() - obj.x[i - 1].getTime() >
          gap * 60 * 60 * 1000
        ) {
          obj.x.splice(i, 0, new Date(obj.x[i - 1].getTime() + 60 * 1000));
          obj.z.map((z) => z.splice(i, 0, null));
          obj.x.splice(i + 1, 0, new Date(obj.x[i + 1].getTime() - 60 * 1000));
          obj.z.map((z) => z.splice(i + 1, 0, null));
          i = i + 2;
        }
      }
      return obj;
    } else {
      return obj;
    }
  };

  onChangeY = (event) => {
    this.setState({ lowerY: event[0], upperY: event[1] });
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
    var ydomain = d3.extent(
      [].concat.apply([], data[file].y).filter((f) => {
        return !isNaN(parseFloat(f)) && isFinite(f);
      })
    );
    var minvalue = zdomain[0];
    var maxvalue = zdomain[1];
    var minY = ydomain[0];
    var maxY = ydomain[1];
    var thresholdStep = 20;

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
      minY,
      maxY,
      thresholdStep,
      upperY: maxY,
      lowerY: minY,
    });
  };

  datetimeFilter = (data, lower, upper, min, max) => {
    if ((lower !== min && lower !== "") || (upper !== max && upper !== "")) {
      if (Array.isArray(data)) {
        var dataout = [];
        for (var i = 0; i < data.length; i++) {
          let slice = this.sliceArray(data[i], lower, upper);
          if (slice) dataout.push(slice);
        }
        return dataout;
      } else {
        return this.sliceArray(data, lower, upper);
      }
    } else {
      return data;
    }
  };

  YFilter = (data, lower, upper, min, max) => {
    if ((lower !== min && lower !== "") || (upper !== max && upper !== "")) {
      if (Array.isArray(data)) {
        var dataout = [];
        for (var i = 0; i < data.length; i++) {
          dataout.push(this.sliceYArray(data[i], lower, upper));
        }
        return dataout;
      } else {
        return this.sliceYArray(data, lower, upper);
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
    if (data.x[0] === upper && data.x[0] === lower) {
      x = data.x;
    }

    var y = data.y;

    var z = [];
    for (var j = 0; j < data.y.length; j++) {
      z.push(data.z[j].slice(l, u));
    }
    if (x.length > 0) {
      return { x: x, y: y, z: z };
    } else {
      return false;
    }
  };

  sliceYArray = (data, lower, upper) => {
    var l = 0;
    var u = data.y.length - 1;
    for (var i = 0; i < data.y.length; i++) {
      if (data.y[i] < lower) {
        l = i;
      }
      if (data.y[i] > upper && u === data.y.length - 1) {
        u = i;
      }
    }
    var y = data.y.slice(l, u);
    var x = data.x;

    var z = [];
    for (var j = 0; j < data.y.length; j++) {
      if (j >= l && j <= u) {
        z.push(data.z[j]);
      }
    }
    return { x: x, y: y, z: z };
  };

  setAxisOptions = (datasetparameters, getLabel) => {
    var xoptions = [];
    var yoptions = [];
    var zoptions = [];
    for (var j = 0; j < datasetparameters.length; j++) {
      if (datasetparameters[j]["axis"].includes("x")) {
        xoptions.push({
          value: datasetparameters[j]["axis"],
          label: getLabel(
            "parameters",
            datasetparameters[j]["parameters_id"],
            "name"
          ),
        });
      } else if (datasetparameters[j]["axis"].includes("y")) {
        yoptions.push({
          value: datasetparameters[j]["axis"],
          label: getLabel(
            "parameters",
            datasetparameters[j]["parameters_id"],
            "name"
          ),
        });
      } else if (datasetparameters[j]["axis"].includes("z")) {
        zoptions.push({
          value: datasetparameters[j]["axis"],
          label: getLabel(
            "parameters",
            datasetparameters[j]["parameters_id"],
            "name"
          ),
        });
      }
    }
    return { xoptions, yoptions, zoptions };
  };

  combineFiles = (files, combined, data, file, xaxis, yaxis, zaxis) => {
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
      plotdata = {
        x: data[0][xaxis],
        y: data[0][yaxis],
        z: data[0][zaxis],
      };
    }
    return plotdata;
  };

  formatDepthTime = (plotdata, xlabel, ylabel) => {
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
    return plotdata;
  };

  componentDidMount() {
    this.setDefault();
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentDidUpdate(prevProps) {
    // If not much data download previous file
    try {
      var { onChangeLower, data, loading } = this.props;
      let test = data.filter((d) => d !== 0);
      if (
        test.length === 1 &&
        test[0].x.length < 5 &&
        !loading &&
        data.length > 1
      ) {
        onChangeLower(new Date((test[0].x[0] - 24 * 60 * 60) * 1000));
      }
    } catch (e) {
      console.log(e);
    }

    // Combine files on update
    if (prevProps.loading && !this.props.loading) {
      var { data } = this.props;
      var { minvalue, maxvalue } = this.state;
      var minY = Infinity;
      var maxY = -Infinity;
      var dldata = data.filter((d) => d !== 0);
      for (var i = 0; i < dldata.length; i++) {
        var ydomain = d3.extent(
          [].concat.apply([], data[i].y).filter((f) => {
            return !isNaN(parseFloat(f)) && isFinite(f);
          })
        );
        var zdomain = d3.extent(
          [].concat.apply([], data[i].z).filter((f) => {
            return !isNaN(parseFloat(f)) && isFinite(f);
          })
        );
        minvalue = Math.min(zdomain[0], minvalue);
        maxvalue = Math.max(zdomain[1], maxvalue);
        minY = Math.min(ydomain[0], minY);
        maxY = Math.max(ydomain[1], maxY);
      }
      this.setState({ minvalue, maxvalue, minY, maxY });
    }
  }

  render() {
    var {
      datasetparameters,
      getLabel,
      data,
      lower,
      upper,
      max,
      min,
      files,
      file,
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
      maxY,
      minY,
      upperY,
      lowerY,
      thresholdStep,
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

    var { xoptions, yoptions, zoptions } = this.setAxisOptions(
      datasetparameters,
      getLabel
    );

    if (!loading) {
      var plotdata = this.combineFiles(
        files,
        combined,
        data,
        file,
        xaxis,
        yaxis,
        zaxis
      );

      if (timeSlider)
        plotdata = this.datetimeFilter(plotdata, lower, upper, min, max);

      if (minY !== lowerY || maxY !== upperY)
        plotdata = this.YFilter(plotdata, lowerY, upperY, minY, maxY);

      if (plotdata.x) plotdata = this.formatDepthTime(plotdata, xlabel, ylabel);

      plotdata = this.addGaps(plotdata, 12);

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
                thresholdStep={thresholdStep}
                minvalue={minvalue}
                maxvalue={maxvalue}
              />
            </div>
          }
          rightNoScroll={
            <HeatMapSidebar
              {...this.props}
              {...this.state}
              value={value}
              timeSlider={timeSlider}
              fileSlider={fileSlider}
              xoptions={xoptions}
              yoptions={yoptions}
              zoptions={zoptions}
              handleAxisSelect={this.handleAxisSelect}
              onChangeY={this.onChangeY}
              onChangeDisplay={this.onChangeDisplay}
            />
          }
          open="False"
        />
      </React.Fragment>
    );
  }
}

export default HeatMap;
