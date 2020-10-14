import React, { Component } from "react";
import * as d3 from "d3";
import SliderDouble from "../../../components/sliders/sliderdouble";
import NumberSliderDouble from "../../../components/sliders/sliderdoublenumber";
import SidebarLayout from "../../../format/sidebarlayout/sidebarlayout";
import DataSelect from "../../../components/dataselect/dataselect";
import FilterBox from "../../../components/filterbox/filterbox";
import D3HeatMap from "../../../graphs/d3/heatmap/heatmap";
import ColorManipulation from "../../../components/colormanipulation/colormanipulation";
import LoadDataSets from "../../../components/loaddatasets/loaddatasets";
import colorlist from "../../../components/colorramp/colors";
import "../datadetail.css";
import { isEqual } from "lodash";

class DisplayOptions extends Component {
  state = {
    colors: this.props.colors,
    title: this.props.title,
    bcolor: this.props.bcolor,
    minZ: this.props.minZ,
    maxZ: this.props.maxZ,
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
    var minZ = parseFloat(event.target.value);
    this.setState({ minZ });
  };
  onChangeLocalMax = (event) => {
    var maxZ = parseFloat(event.target.value);
    this.setState({ maxZ });
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
      prevProps.minZ !== this.props.minZ ||
      prevProps.maxZ !== this.props.maxZ ||
      prevProps.thresholdStep !== this.props.thresholdStep
    ) {
      var { colors, title, bcolor, minZ, maxZ, thresholdStep } = this.props;
      this.setState({
        colors,
        title,
        bcolor,
        minZ,
        maxZ,
        thresholdStep,
      });
    }
  }
  render() {
    var { colors, title, bcolor, minZ, maxZ, thresholdStep } = this.state;
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
                      id="maxZ"
                      value={maxZ}
                      onChange={this.onChangeLocalMax}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Minimum</td>
                  <td>
                    <input
                      type="number"
                      id="minZ"
                      value={minZ}
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
    var { timeaxis } = this.props;
    var preopenx = false;
    var preopeny = false;
    if (timeaxis === "x") preopenx = true;
    if (timeaxis === "y") preopeny = true;
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
        <FilterBox
          title={this.props.xlabel + " Range"}
          content={
            timeaxis === "x" ? (
              <div className="side-date-slider">
                <SliderDouble
                  onChange={this.props.onChangeTime}
                  onChangeLower={this.props.onChangeLower}
                  onChangeUpper={this.props.onChangeUpper}
                  min={this.props.minX}
                  max={this.props.maxX}
                  lower={this.props.lowerX}
                  upper={this.props.upperX}
                  files={this.props.files}
                />
                <LoadDataSets
                  data={this.props.data}
                  downloadData={this.props.downloadData}
                />
              </div>
            ) : (
              <div className="side-date-slider">
                <NumberSliderDouble
                  onChange={this.props.onChangeX}
                  min={this.props.minX}
                  max={this.props.maxX}
                  lower={this.props.lowerX}
                  upper={this.props.upperX}
                  unit={this.props.xunits}
                />
              </div>
            )
          }
          preopen={preopenx}
        />
        <FilterBox
          title={this.props.ylabel + " Range"}
          content={
            timeaxis === "y" ? (
              <div className="side-date-slider">
                <SliderDouble
                  onChange={this.props.onChangeTime}
                  onChangeLower={this.props.onChangeLower}
                  onChangeUpper={this.props.onChangeUpper}
                  min={this.props.minY}
                  max={this.props.maxY}
                  lower={this.props.lowerY}
                  upper={this.props.upperY}
                  files={this.props.files}
                />
                <LoadDataSets
                  data={this.props.data}
                  downloadData={this.props.downloadData}
                />
              </div>
            ) : (
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
            )
          }
          preopen={preopeny}
        />
        <DisplayOptions
          colors={this.props.colors}
          title={this.props.title}
          bcolor={this.props.bcolor}
          thresholdStep={this.props.thresholdStep}
          minZ={this.props.minZ}
          maxZ={this.props.maxZ}
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
    xlabel: "None",
    ylabel: "None",
    zlabel: "None",
    xunits: "None",
    yunits: "None",
    zunits: "None",
    timeaxis: "",
    depthaxis: "",
    thresholdStep: 20,
    download: false,
    upperY: 1,
    lowerY: 0,
    upperX: 1,
    lowerX: 0,
    upperZ: 1,
    lowerZ: 0,
    maxY: 1,
    minY: 0,
    maxX: 1,
    minX: 0,
    maxZ: 1,
    minZ: 0,
    plotdata: [],
    value: "",
  };

  addGaps = (obj, timeaxis, gap) => {
    if (timeaxis === "x" && obj) {
      for (let i = 1; i < obj.x.length; i++) {
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
    } else if (timeaxis === "y" && obj) {
      return obj;
    } else {
      return obj;
    }
  };

  onChangeY = (event) => {
    this.setState({ lowerY: event[0], upperY: event[1] });
  };

  onChangeX = (event) => {
    this.setState({ lowerX: event[0], upperX: event[1] });
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
      minZ,
      maxZ,
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
      minZ = zdomain[0];
      maxZ = zdomain[1];
    }
    this.setState({
      ylabel,
      xlabel,
      zlabel,
      yunits,
      xunits,
      zunits,
      minZ,
      maxZ,
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
    var {
      datasetparameters,
      dataset,
      getLabel,
      data,
      file,
      maxdatetime,
      mindatetime,
    } = this.props;
    var { xaxis, yaxis, zaxis, timeaxis, depthaxis } = this.state;

    // Get axis labels and units
    const xparam = datasetparameters.find((x) => x.axis === xaxis);
    const yparam = datasetparameters.find((y) => y.axis === yaxis);
    const zparam = datasetparameters.find((z) => z.axis === zaxis);
    if (xparam.parameters_id === 1) timeaxis = "x";
    if (yparam.parameters_id === 1) timeaxis = "y";
    if (xparam.parameters_id === 2) depthaxis = "x";
    if (yparam.parameters_id === 2) depthaxis = "y";
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
    var xdomain = d3.extent(
      [].concat.apply([], data[file].x).filter((f) => {
        return !isNaN(parseFloat(f)) && isFinite(f);
      })
    );
    var minZ = zdomain[0] || 0;
    var maxZ = zdomain[1] || 1;
    var minY = ydomain[0];
    var maxY = ydomain[1];
    var minX = xdomain[0];
    var maxX = xdomain[1];
    var lowerY = minY;
    var upperY = maxY;
    var lowerX = minX;
    var upperX = maxX;
    var lowerZ = minZ;
    var upperZ = maxZ;

    if (timeaxis === "x" && maxdatetime && mindatetime) {
      minX = Math.min(minX, mindatetime);
      maxX = Math.max(maxX, maxdatetime);
    }

    if (timeaxis === "y" && maxdatetime && mindatetime) {
      minY = Math.min(minY, mindatetime);
      maxY = Math.max(maxY, maxdatetime);
    }

    var thresholdStep = 20;

    var { xoptions, yoptions, zoptions } = this.setAxisOptions(
      datasetparameters,
      getLabel
    );

    var plotdata = this.processPlotData(
      xaxis,
      yaxis,
      zaxis,
      upperY,
      lowerY,
      maxY,
      minY,
      upperX,
      lowerX,
      minX,
      maxX,
      timeaxis,
      depthaxis
    );

    this.setState({
      title,
      xlabel,
      ylabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      colors,
      minX,
      maxX,
      minZ,
      maxZ,
      minY,
      maxY,
      lowerY,
      upperY,
      lowerX,
      upperX,
      lowerZ,
      upperZ,
      timeaxis,
      depthaxis,
      thresholdStep,
      xoptions,
      yoptions,
      zoptions,
      plotdata,
    });
  };

  sliceXArray = (data, lower, upper) => {
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

  sliceData = (
    plotdata,
    upperX,
    lowerX,
    upperY,
    lowerY,
    minX,
    maxX,
    minY,
    maxY
  ) => {
    if (upperX < maxX || lowerX > minX) {
      if (Array.isArray(plotdata)) {
        var dataoutX = [];
        for (let i = 0; i < plotdata.length; i++) {
          let slice = this.sliceXArray(plotdata[i], lowerX, upperX);
          if (slice) dataoutX.push(slice);
        }
        plotdata = dataoutX;
      } else {
        plotdata = this.sliceXArray(plotdata, lowerX, upperX);
      }
    }
    if (upperY < maxY || lowerY > minY) {
      if (Array.isArray(plotdata)) {
        var dataoutY = [];
        for (let i = 0; i < plotdata.length; i++) {
          dataoutY.push(this.sliceYArray(plotdata[i], lowerY, upperY));
        }
        plotdata = dataoutY;
      } else {
        plotdata = this.sliceYArray(plotdata, lowerY, upperY);
      }
    }
    return plotdata;
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

  formatDepthTime = (plotdata, timeaxis, depthaxis) => {
    if (Array.isArray(plotdata)) {
      for (var i = 0; i < plotdata.length; i++) {
        if (timeaxis !== "")
          plotdata[i][timeaxis] = plotdata[i][timeaxis].map((i) =>
            this.formatDate(i)
          );
        if (depthaxis !== "")
          plotdata[i][depthaxis] = plotdata[i][depthaxis].map((i) => -i);
      }
    } else {
      if (timeaxis !== "")
        plotdata[timeaxis] = plotdata[timeaxis].map((i) => this.formatDate(i));
      if (depthaxis !== "")
        plotdata[depthaxis] = plotdata[depthaxis].map((i) => -i);
    }
    return plotdata;
  };

  processPlotData = (
    xaxis,
    yaxis,
    zaxis,
    upperY,
    lowerY,
    maxY,
    minY,
    upperX,
    lowerX,
    minX,
    maxX,
    timeaxis,
    depthaxis
  ) => {
    var { data, files, file, combined } = this.props;
    var plotdata = this.combineFiles(
      files,
      combined,
      data,
      file,
      xaxis,
      yaxis,
      zaxis
    );

    try {
      plotdata = this.sliceData(
        plotdata,
        upperX,
        lowerX,
        upperY,
        lowerY,
        minX,
        maxX,
        minY,
        maxY
      );

      plotdata = this.formatDepthTime(plotdata, timeaxis, depthaxis);

      plotdata = this.addGaps(plotdata, timeaxis, 12);
    } catch (e) {
      console.error(e);
    }

    return plotdata;
  };

  componentDidMount() {
    this.setDefault();
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentDidUpdate(prevProps, prevState) {
    var { data, loading, onChangeLower, upper, lower } = this.props;
    var {
      minZ,
      maxZ,
      xaxis,
      yaxis,
      zaxis,
      upperY,
      lowerY,
      maxY,
      minY,
      upperX,
      lowerX,
      maxX,
      minX,
      timeaxis,
      depthaxis,
    } = this.state;

    // If not much data download previous file
    try {
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
    if (prevProps.loading && !loading) {
      // Update min max
      minY = Infinity;
      maxY = -Infinity;
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
        minZ = Math.min(zdomain[0], minZ);
        maxZ = Math.max(zdomain[1], maxZ);
        minY = Math.min(ydomain[0], minY);
        maxY = Math.max(ydomain[1], maxY);
      }

      this.setState({ minZ, maxZ, minY, maxY });
    }

    // Update time bounds
    if (prevProps.upper !== upper) {
      if (timeaxis === "x") {
        upperX = upper;
      } else if (timeaxis === "y") {
        upperY = upper;
      }
    } else if (prevProps.lower !== lower) {
      if (timeaxis === "x") {
        lowerX = lower;
      } else if (timeaxis === "y") {
        lowerY = lower;
      }
    }

    // Reprocess plot data
    var params = [
      xaxis,
      yaxis,
      zaxis,
      upperY,
      lowerY,
      maxY,
      minY,
      upperX,
      lowerX,
      minX,
      maxX,
      timeaxis,
      depthaxis,
    ];

    var prevparams = [
      prevState.xaxis,
      prevState.yaxis,
      prevState.zaxis,
      prevState.upperY,
      prevState.lowerY,
      prevState.maxY,
      prevState.minY,
      prevState.upperX,
      prevState.lowerX,
      prevState.minX,
      prevState.maxX,
      prevState.timeaxis,
      prevState.depthaxis,
    ];

    if ((prevProps.loading && !loading) || !isEqual(params, prevparams)) {
      var plotdata = this.processPlotData(...params);
      this.setState({ plotdata, upperX, lowerX, upperY, lowerY });
    }
  }

  render() {
    var { files, file } = this.props;
    const {
      bcolor,
      title,
      xlabel,
      ylabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      colors,
      minZ,
      maxZ,
      thresholdStep,
      xoptions,
      yoptions,
      zoptions,
      plotdata,
    } = this.state;
    var value = new Date(files[file].ave);
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
                minvalue={minZ}
                maxvalue={maxZ}
              />
            </div>
          }
          rightNoScroll={
            <HeatMapSidebar
              {...this.props}
              {...this.state}
              value={value}
              xoptions={xoptions}
              yoptions={yoptions}
              zoptions={zoptions}
              minZ={minZ}
              maxZ={maxZ}
              handleAxisSelect={this.handleAxisSelect}
              onChangeY={this.onChangeY}
              onChangeX={this.onChangeX}
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
