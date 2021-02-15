import React, { Component } from "react";
import * as d3 from "d3";
import SidebarLayout from "../../../format/sidebarlayout/sidebarlayout";
import ColorManipulation from "../../../components/colormanipulation/colormanipulation";
import DataSelect from "../../../components/dataselect/dataselect";
import Loading from "../../../components/loading/loading";
import D3HeatMap from "../../../graphs/d3/heatmap/heatmap";
import SliderDouble from "../../../components/sliders/sliderdouble";
import SliderSingle from "../../../components/sliders/slidersingle";
import NumberSliderDouble from "../../../components/sliders/sliderdoublenumber";
import LoadDataSets from "../../../components/loaddatasets/loaddatasets";
import D3LineGraph from "../../../graphs/d3/linegraph/linegraph";
import FilterBox from "../../../components/filterbox/filterbox";
import colorlist from "../../../components/colorramp/colors";
import { isArray, isInteger } from "lodash";

class Graph extends Component {
  render() {
    var {
      graph,
      plotdata,
      title,
      xlabel,
      ylabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      bcolor,
      colors,
      thresholdStep,
      minZ,
      maxZ,
      confidence,
      lcolor,
      lweight,
      timeaxis,
      xReverse,
      yReverse,
      file,
      files,
    } = this.props;
    switch (graph) {
      default:
        return (
          <React.Fragment>
            <table className="loading-table">
              <tbody>
                <tr>
                  <td>
                    <Loading />
                    Loading Data
                  </td>
                </tr>
              </tbody>
            </table>
          </React.Fragment>
        );
      case "heatmap":
        return (
          <React.Fragment>
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
              yReverse={yReverse}
              xReverse={xReverse}
            />
          </React.Fragment>
        );
      case "linegraph":
        var xscale = "Linear";
        var yscale = "Linear";
        if (timeaxis === "x") xscale = "Time";
        if (timeaxis === "y") yscale = "Time";
        var legend = [];
        for (var i = 0; i < file.length; i++) {
          var value = new Date(files[file[i]].ave);
          var text = value.toDateString() + " " + value.toLocaleTimeString();
          var color = lcolor[i];
          legend.push({ id: i, color, text, value });
        }
        return (
          <React.Fragment>
            <D3LineGraph
              data={plotdata}
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
              yReverse={yReverse}
              xReverse={xReverse}
              setDownloadGraph={this.setDownloadGraph}
            />
          </React.Fragment>
        );
    }
  }
}

class Sidebar extends Component {
  render() {
    return (
      <React.Fragment>
        <AxisSelect
          graph={this.props.graph}
          xaxis={this.props.xaxis}
          yaxis={this.props.yaxis}
          zaxis={this.props.zaxis}
          xoptions={this.props.xoptions}
          yoptions={this.props.yoptions}
          zoptions={this.props.zoptions}
          handleAxisSelect={this.props.handleAxisSelect}
        />
        <Range {...this.props} />
        <DisplayOptions {...this.props} />
      </React.Fragment>
    );
  }
}

class AxisSelect extends Component {
  render() {
    var {
      graph,
      xaxis,
      yaxis,
      zaxis,
      xoptions,
      yoptions,
      zoptions,
      handleAxisSelect,
    } = this.props;
    return (
      <FilterBox
        title="Axis"
        preopen="true"
        content={
          <div>
            {xaxis && (
              <div>
                x:{" "}
                <div className="axis-select">
                  <DataSelect
                    value="value"
                    label="label"
                    dataList={xoptions}
                    defaultValue={xaxis}
                    onChange={handleAxisSelect}
                  />
                </div>
              </div>
            )}
            {yaxis && (
              <div>
                y:{" "}
                <div className="axis-select">
                  <DataSelect
                    value="value"
                    label="label"
                    dataList={yoptions}
                    defaultValue={yaxis}
                    onChange={handleAxisSelect}
                  />
                </div>
              </div>
            )}
            {zaxis && (
              <div>
                z:{" "}
                <div className="axis-select">
                  <DataSelect
                    value="value"
                    label="label"
                    dataList={zoptions}
                    defaultValue={zaxis}
                    disabled={graph === "linegraph"}
                    onChange={handleAxisSelect}
                  />
                </div>
              </div>
            )}
          </div>
        }
      />
    );
  }
}

class Range extends Component {
  closest = (num, arr) => {
    var diff = Infinity;
    var index = 0;
    for (var i = 0; i < arr.length; i++) {
      var newdiff = Math.abs(num - arr[i]);
      if (newdiff < diff) {
        diff = newdiff;
        index = i;
      }
    }
    return index;
  };

  onChangeLowerX = (event) => {
    this.props.onChangeX([event.getTime(), this.props.upperX * 1000]);
  };

  onChangeLowerY = (event) => {
    this.props.onChangeY([event.getTime(), this.props.upperY * 1000]);
  };

  onChangeUpperX = (event) => {
    this.props.onChangeX([this.props.lowerX * 1000, event.getTime()]);
  };

  onChangeUpperY = (event) => {
    this.props.onChangeY([this.props.lowerY * 1000, event.getTime()]);
  };

  onChangeFile = (event) => {
    var { onChangeFile, files } = this.props;
    var id = this.closest(
      event[0],
      files.map((a) => a.ave.getTime())
    );
    if (id > 0 && id < files.length) onChangeFile(id);
  };

  render() {
    var { timeaxis, graph, files, file, onChangeX, onChangeY } = this.props;
    var { minX, maxX, minY, maxY, lowerX, upperX, lowerY, upperY } = this.props;
    var { data, downloadData, xunits, yunits, xlabel, ylabel } = this.props;

    switch (graph) {
      default:
        return <React.Fragment></React.Fragment>;
      case "heatmap":
        return (
          <React.Fragment>
            <FilterBox
              title={"y" === timeaxis ? ylabel + " Range" : xlabel + " Range"}
              content={
                ["x", "y"].includes(timeaxis) ? (
                  <div className="side-date-slider">
                    <SliderDouble
                      onChange={"x" === timeaxis ? onChangeX : onChangeY}
                      onChangeLower={
                        "x" === timeaxis
                          ? this.onChangeLowerX
                          : this.onChangeLowerY
                      }
                      onChangeUpper={
                        "x" === timeaxis
                          ? this.onChangeUpperX
                          : this.onChangeUpperY
                      }
                      min={"x" === timeaxis ? minX : minY}
                      max={"x" === timeaxis ? maxX : maxY}
                      lower={"x" === timeaxis ? lowerX : lowerY}
                      upper={"x" === timeaxis ? upperX : upperY}
                      files={files}
                    />
                    <LoadDataSets data={data} downloadData={downloadData} />
                  </div>
                ) : (
                  <div className="side-date-slider">
                    <NumberSliderDouble
                      onChange={onChangeX}
                      min={minX}
                      max={maxX}
                      lower={lowerX}
                      upper={upperX}
                      unit={xunits}
                    />
                  </div>
                )
              }
              preopen={true}
            />
            <FilterBox
              title={"y" === timeaxis ? xlabel + " Range" : ylabel + " Range"}
              content={
                "y" === timeaxis ? (
                  <div className="side-date-slider">
                    <NumberSliderDouble
                      onChange={onChangeX}
                      min={minX}
                      max={maxX}
                      lower={lowerX}
                      upper={upperX}
                      unit={xunits}
                    />
                  </div>
                ) : (
                  <div className="side-date-slider">
                    <NumberSliderDouble
                      onChange={onChangeY}
                      min={minY}
                      max={maxY}
                      lower={lowerY}
                      upper={upperY}
                      unit={yunits}
                    />
                  </div>
                )
              }
              preopen={false}
            />
          </React.Fragment>
        );
      case "linegraph":
        var connect = files[file[0]].connect;
        var { onChangeFile, toggleAddNewFile, removeFile, lcolor } = this.props;
        if (connect === "ind") {
          // Special range selector for individual profiles
          var { mindatetime, maxdatetime, addNewFiles } = this.props;
          var fileControl = [];
          if (file.length > 0) {
            var value = files[file[file.length - 1]].ave;
            for (var i = 0; i < file.length; i++) {
              let dt = new Date(files[file[i]].ave);
              let text = dt.toDateString() + " " + dt.toLocaleTimeString();
              fileControl.push(
                <tr key={"file" + i}>
                  <td>
                    <div
                      className="color-line"
                      style={{ backgroundColor: lcolor[i] }}
                    />
                  </td>
                  <td>{text}</td>
                  <td
                    id={i}
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
          return (
            <React.Fragment>
              <FilterBox
                title="Files"
                preopen="true"
                content={
                  <div className="">
                    <SliderSingle
                      onChange={this.onChangeFile}
                      onChangeFileInt={onChangeFile}
                      file={file}
                      value={value}
                      min={mindatetime}
                      max={maxdatetime}
                      files={files}
                      type="time"
                    />
                    <LoadDataSets data={data} downloadData={downloadData} />
                    <div className="keeplines">
                      Keep previously plotted line{" "}
                      <input
                        checked={addNewFiles}
                        type="checkbox"
                        onChange={toggleAddNewFile}
                      />
                    </div>
                    <table className="filecontrol">
                      <tbody>{fileControl}</tbody>
                    </table>
                  </div>
                }
              />
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment>
              <FilterBox
                title={"y" === timeaxis ? ylabel + " Range" : xlabel + " Range"}
                content={
                  ["x", "y"].includes(timeaxis) ? (
                    <div className="side-date-slider">
                      <SliderDouble
                        onChange={"x" === timeaxis ? onChangeX : onChangeY}
                        onChangeLower={
                          "x" === timeaxis
                            ? this.onChangeLowerX
                            : this.onChangeLowerY
                        }
                        onChangeUpper={
                          "x" === timeaxis
                            ? this.onChangeUpperX
                            : this.onChangeUpperY
                        }
                        min={"x" === timeaxis ? minX : minY}
                        max={"x" === timeaxis ? maxX : maxY}
                        lower={"x" === timeaxis ? lowerX : lowerY}
                        upper={"x" === timeaxis ? upperX : upperY}
                        files={files}
                      />
                      <LoadDataSets data={data} downloadData={downloadData} />
                    </div>
                  ) : (
                    <div className="side-date-slider">
                      <NumberSliderDouble
                        onChange={onChangeX}
                        min={minX}
                        max={maxX}
                        lower={lowerX}
                        upper={upperX}
                        unit={xunits}
                      />
                    </div>
                  )
                }
                preopen={true}
              />
            </React.Fragment>
          );
        }
    }
  }
}

class DisplayOptions extends Component {
  state = {
    colors: this.props.colors,
    title: this.props.title,
    bcolor: this.props.bcolor,
    minZ: this.props.minZ,
    maxZ: this.props.maxZ,
    mask: this.props.mask,
    thresholdStep: this.props.thresholdStep,
    decimate: this.props.decimate,
    average: this.props.average,
  };
  toggleMask = () => {
    this.setState({ mask: !this.state.mask });
  };

  onChangeDecimate = (event) => {
    var decimate = parseInt(event.target.value);
    this.setState({ decimate });
  };
  onChangeAverage = (event) => {
    var average = event.target.value;
    this.setState({ average });
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
    this.props.onChangeState(this.state);
  };
  componentDidUpdate(prevProps) {
    var {
      colors,
      title,
      bcolor,
      minZ,
      maxZ,
      thresholdStep,
      decimate,
      average,
    } = this.props;
    var updateZ = false;
    if (
      !isNaN(minZ) &&
      !isNaN(maxZ) &&
      (prevProps.minZ !== minZ || prevProps.maxZ !== maxZ)
    ) {
      updateZ = true;
    }
    if (
      prevProps.title !== title ||
      prevProps.colors !== colors ||
      updateZ ||
      prevProps.thresholdStep !== thresholdStep ||
      prevProps.decimate !== decimate ||
      prevProps.average !== average
    ) {
      this.setState({
        colors,
        title,
        bcolor,
        minZ,
        maxZ,
        thresholdStep,
        decimate,
        average,
      });
    }
  }
  render() {
    var {
      colors,
      title,
      bcolor,
      minZ,
      maxZ,
      thresholdStep,
      mask,
      decimate,
      average,
    } = this.state;
    var { array, graph, timeaxis } = this.props;
    maxZ = maxZ === undefined ? 0 : maxZ;
    minZ = minZ === undefined ? 0 : minZ;
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
                {graph === "heatmap" && (
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
                )}
                {graph === "heatmap" && (
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
                )}
                {graph === "heatmap" && (
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
                )}
                {["x", "y"].includes(timeaxis) && (
                  <tr>
                    <td>Down Sample</td>
                    <td>
                      1:
                      <input
                        className="downsample"
                        type="number"
                        step="1"
                        min="1"
                        value={decimate}
                        onChange={this.onChangeDecimate}
                      />
                    </td>
                  </tr>
                )}
                {["x", "y"].includes(timeaxis) && (
                  <tr>
                    <td>Averaging</td>
                    <td>
                      <select
                        id="average"
                        value={average}
                        onChange={this.onChangeAverage}
                        className="scale-select"
                      >
                        <option value="None">None</option>
                        <option value="Hourly">Hourly</option>
                        <option value="Daily">Daily</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </td>
                  </tr>
                )}
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
              </tbody>
            </table>
            {graph === "heatmap" && (
              <ColorManipulation
                onChange={this.onChangeLocalColors}
                colors={colors}
                array={array}
              />
            )}
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

class Plot extends Component {
  state = {
    plotdata: [],
    xaxis: "x",
    yaxis: "y",
    zaxis: "z",
    xoptions: [],
    yoptions: [],
    zoptions: [],
    xlabel: "",
    ylabel: "",
    zlabel: "",
    xunits: "",
    yunits: "",
    zunits: "",
    graph: "linegraph",
    colors: [
      { color: "#0000ff", point: 0 },
      { color: "#ff0000", point: 1 },
    ],
    title: "",
    bcolor: "#ffffff",
    lcolor: [
      "#000000",
      "#e6194B",
      "#3cb44b",
      "#ffe119",
      "#4363d8",
      "#f58231",
      "#911eb4",
      "#42d4f4",
      "#f032e6",
      "#bfef45",
      "#fabed4",
      "#469990",
      "#dcbeff",
      "#9A6324",
      "#fffac8",
      "#800000",
      "#aaffc3",
      "#808000",
      "#ffd8b1",
      "#000075",
    ],
    thresholdStep: 20,
    lweight: Array.from({ length: 20 }).map((x) => "1"),
    decimate: 1,
    average: "None",
    mask: true,
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
    yReverse: false,
    xReverse: false,
    timeaxis: "",
    refresh: false,
    addNewFiles: true,
  };

  closest = (num, arr) => {
    var diff = Infinity;
    var index = 0;
    for (var i = 0; i < arr.length; i++) {
      var newdiff = Math.abs(num - arr[i]);
      if (newdiff < diff) {
        diff = newdiff;
        index = i;
      }
    }
    return index;
  };

  average = (nums) => {
    return nums.reduce((a, b) => a + b) / nums.length;
  };

  toggleAddNewFile = () => {
    this.setState({ addNewFiles: !this.state.addNewFiles });
  };

  onChangeState = (state) => {
    state.refresh = "z";
    this.setState(state);
  };

  onChangeY = async (event) => {
    var lower = event[0];
    var upper = event[1];
    if (
      lower !== this.state.lowerY * 1000 ||
      upper !== this.state.upperY * 1000
    ) {
      var { downloadMultipleFiles, data, files } = this.props;
      var { timeaxis } = this.state;
      if (timeaxis === "y") {
        var toDownload = [];
        for (var i = 0; i < files.length; i++) {
          if (
            new Date(files[i].mindatetime).getTime() < upper &&
            new Date(files[i].maxdatetime).getTime() > lower &&
            data[i] === 0
          ) {
            toDownload.push(i);
          }
        }
        upper = upper / 1000;
        lower = lower / 1000;
        if (toDownload.length > 0) {
          document.getElementById("detailloading").style.display = "block";
          await downloadMultipleFiles(toDownload);
          document.getElementById("detailloading").style.display = "none";
        }
      }
      this.setState({ lowerY: lower, upperY: upper, refresh: true });
    }
  };

  onChangeX = async (event) => {
    var lower = event[0];
    var upper = event[1];
    if (
      lower !== this.state.lowerX * 1000 ||
      upper !== this.state.upperX * 1000
    ) {
      var { downloadMultipleFiles, data, files } = this.props;
      var { timeaxis } = this.state;
      if (timeaxis === "x") {
        var toDownload = [];
        for (var i = 0; i < files.length; i++) {
          if (
            new Date(files[i].mindatetime).getTime() < upper &&
            new Date(files[i].maxdatetime).getTime() > lower &&
            data[i] === 0
          ) {
            toDownload.push(i);
          }
        }
        upper = upper / 1000;
        lower = lower / 1000;
        if (toDownload.length > 0) {
          document.getElementById("detailloading").style.display = "block";
          await downloadMultipleFiles(toDownload);
          document.getElementById("detailloading").style.display = "none";
        }
      }
      this.setState({ lowerX: lower, upperX: upper, refresh: true });
    }
  };

  onChangeFile = async (event) => {
    var { file, data, downloadMultipleFiles } = this.props;
    var { addNewFiles } = this.state;
    if (!file.includes(event) && file.length < 20) {
      if (!addNewFiles) file = [];
      file.push(event);
      if (data[event] === 0) {
        document.getElementById("detailloading").style.display = "block";
        await downloadMultipleFiles([event], file);
        document.getElementById("detailloading").style.display = "none";
      } else {
        await downloadMultipleFiles([], file);
      }
    }
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

  findLink = (parameters, link) => {
    return parameters.find((p) => p.id === link);
  };

  setAxisOptions = (datasetparameters, xaxis, yaxis, zaxis) => {
    var xoptions = [];
    var yoptions = [];
    var zoptions = [];
    var graph = "linegraph";
    var xdp = datasetparameters.find((dp) => dp.axis === xaxis);
    var ydp = datasetparameters.find((dp) => dp.axis === yaxis);
    var yReverse = false;
    var xReverse = false;
    if ([2, 18, 43].includes(xdp.parameters_id)) xReverse = true;
    if ([2, 18, 43].includes(ydp.parameters_id)) yReverse = true;
    for (var j = 0; j < datasetparameters.length; j++) {
      var detail = datasetparameters[j]["detail"];
      var link = datasetparameters[j]["link"];
      var extra = "";
      if (Number.isInteger(link) && this.findLink(datasetparameters, link)) {
        extra = ` (${this.findLink(datasetparameters, link).name})`;
      } else if (["none", null, "null"].includes(detail)) {
        extra = "";
      } else {
        extra = ` (${detail})`;
      }

      if (datasetparameters[j]["axis"].includes("x")) {
        xoptions.push({
          value: datasetparameters[j]["axis"],
          label: datasetparameters[j]["name"] + extra,
        });
      } else if (datasetparameters[j]["axis"].includes("y")) {
        yoptions.push({
          value: datasetparameters[j]["axis"],
          label: datasetparameters[j]["name"] + extra,
        });
      } else if (datasetparameters[j]["axis"].includes("z")) {
        if (
          xdp.shape[0] === datasetparameters[j].shape[1] &&
          ydp.shape[0] === datasetparameters[j].shape[0]
        ) {
          graph = "heatmap";
        }
        zoptions.push({
          value: datasetparameters[j]["axis"],
          label: datasetparameters[j]["name"] + extra,
        });
      }
    }
    return { xoptions, yoptions, zoptions, graph, yReverse, xReverse };
  };

  getAxisLabels = (datasetparameters, xaxis, yaxis, zaxis) => {
    var xdp = datasetparameters.find((dp) => dp.axis === xaxis);
    var ydp = datasetparameters.find((dp) => dp.axis === yaxis);
    var zdp = datasetparameters.find((dp) => dp.axis === zaxis);

    var xlabel = xdp ? xdp.name : "";
    var ylabel = ydp ? ydp.name : "";
    var zlabel = zdp ? zdp.name : "";

    var xunits = xdp ? xdp.unit : "";
    var yunits = ydp ? ydp.unit : "";
    var zunits = zdp ? zdp.unit : "";

    return { xlabel, ylabel, zlabel, xunits, yunits, zunits };
  };

  handleAxisSelect = (event) => {
    var { datasetparameters } = this.props;
    var { xaxis, yaxis, zaxis } = this.state;
    if (event.value.includes("x")) xaxis = event.value;
    if (event.value.includes("y")) yaxis = event.value;
    if (event.value.includes("z")) zaxis = event.value;
    var {
      xoptions,
      yoptions,
      zoptions,
      graph,
      yReverse,
      xReverse,
    } = this.setAxisOptions(datasetparameters, xaxis, yaxis, zaxis);
    var { xlabel, ylabel, zlabel, xunits, yunits, zunits } = this.getAxisLabels(
      datasetparameters,
      xaxis,
      yaxis,
      zaxis
    );

    this.setState({
      xaxis,
      yaxis,
      zaxis,
      xoptions,
      yoptions,
      zoptions,
      graph,
      xlabel,
      ylabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      yReverse,
      xReverse,
      refresh: true,
    });
  };

  maskArray = (arr, maskArr, mask) => {
    var out = [];
    if (mask && isArray(maskArr) && arr.length === maskArr.length) {
      if (isArray(arr[0])) {
        for (let i = 0; i < arr.length; i++) {
          let inner = [];
          for (let j = 0; j < arr[i].length; j++) {
            if (maskArr[i][j] < 1) {
              inner.push(arr[i][j]);
            } else {
              inner.push(null);
            }
          }
          out.push(inner);
        }
      } else {
        for (let i = 0; i < arr.length; i++) {
          if (maskArr[i] < 1) {
            out.push(arr[i]);
          } else {
            out.push(null);
          }
        }
      }
      return out;
    } else {
      return arr;
    }
  };

  selectAxisAndMask = (files, data, file, xaxis, yaxis, zaxis, dp, mask) => {
    var plotdata;

    // Looks for mask variables

    var mxaxis = false;
    var myaxis = false;
    var mzaxis = false;

    var xp = dp.find((p) => p.axis === xaxis);
    var yp = dp.find((p) => p.axis === yaxis);
    var zp = dp.find((p) => p.axis === zaxis);

    if (xp && dp.find((dp) => dp.link === xp.id && dp.parameters_id === 27)) {
      mxaxis = dp.find((dp) => dp.link === xp.id && dp.parameters_id === 27)[
        "axis"
      ];
    }

    if (yp && dp.find((dp) => dp.link === yp.id && dp.parameters_id === 27)) {
      mxaxis = dp.find((dp) => dp.link === yp.id && dp.parameters_id === 27)[
        "axis"
      ];
    }

    if (zp && dp.find((dp) => dp.link === zp.id && dp.parameters_id === 27)) {
      mxaxis = dp.find((dp) => dp.link === zp.id && dp.parameters_id === 27)[
        "axis"
      ];
    }

    // Case 1: Join
    if (files[file[0]].connect === "join") {
      plotdata = [];
      for (var k = 0; k < data.length; k++) {
        if (data[k] !== 0) {
          plotdata.push({
            x: this.maskArray(data[k][xaxis], data[k][mxaxis], mask),
            y: this.maskArray(data[k][yaxis], data[k][myaxis], mask),
            z: this.maskArray(data[k][zaxis], data[k][mzaxis], mask),
          });
        }
      }
      // Case 2: Individual
    } else if (files[file[0]].connect === "ind") {
      plotdata = [];
      for (var j = 0; j < file.length; j++) {
        plotdata.push({
          x: this.maskArray(data[file[j]][xaxis], data[file[j]][mxaxis], mask),
          y: this.maskArray(data[file[j]][yaxis], data[file[j]][myaxis], mask),
          z: this.maskArray(data[file[j]][zaxis], data[file[j]][mzaxis], mask),
        });
      }
      // Case 3: Single file
    } else {
      plotdata = {
        x: this.maskArray(data[0][xaxis], data[0][mxaxis], mask),
        y: this.maskArray(data[0][yaxis], data[0][myaxis], mask),
        z: this.maskArray(data[0][zaxis], data[0][mzaxis], mask),
      };
    }
    return plotdata;
  };

  formatTime = (plotdata, datasetparameters, xaxis, yaxis) => {
    var xdp = datasetparameters.find((dp) => dp.axis === xaxis);
    var ydp = datasetparameters.find((dp) => dp.axis === yaxis);

    if (xdp.parameters_id === 1) {
      if (isArray(plotdata)) {
        for (let i = 0; i < plotdata.length; i++) {
          plotdata[i].x = plotdata[i].x.map((pdx) => new Date(pdx * 1000));
        }
      } else {
        plotdata.x = plotdata.x.map((pdx) => new Date(pdx * 1000));
      }
    }
    if (ydp.parameters_id === 1) {
      if (isArray(plotdata)) {
        for (let i = 0; i < plotdata.length; i++) {
          plotdata[i].y = plotdata[i].y.map((pdy) => new Date(pdy * 1000));
        }
      } else {
        plotdata.y = plotdata.y.map((pdy) => new Date(pdy * 1000));
      }
    }
    return plotdata;
  };

  joinData = (plotdata, graph, connect, timeaxis) => {
    if (graph === "linegraph" && isArray(plotdata) && connect === "join") {
      var data = [];
      for (var i = 0; i < plotdata.length; i++) {
        for (var j = 0; j < plotdata[i].x.length; j++) {
          data.push({ x: plotdata[i].x[j], y: plotdata[i].y[j] });
        }
      }
      if (timeaxis === "x") {
        data.sort((a, b) => (a.x > b.x ? 1 : b.x > a.x ? -1 : 0));
      } else if (timeaxis === "y") {
        data.sort((a, b) => (a.y > b.y ? 1 : b.y > a.y ? -1 : 0));
      }

      var x = [];
      var y = [];
      for (var k = 0; k < data.length; k++) {
        x.push(data[k].x);
        y.push(data[k].y);
      }
      return { x, y, z: undefined };
    } else {
      return plotdata;
    }
  };

  roundFactor = (dt, factor) => {
    var year = dt.getFullYear();
    var month = dt.getMonth();
    var day = dt.getDate();
    var hours = dt.getHours();
    if (factor === "Hourly") {
      return new Date(year, month, day, hours);
    } else if (factor === "Daily") {
      return new Date(year, month, day);
    } else if (factor === "Monthly") {
      return new Date(year, month, 0);
    } else if (factor === "Yearly") {
      return new Date(year, 0, 0);
    } else {
      return dt;
    }
  };

  average1D = (arr, factor, tx) => {
    var ox = "y";
    if (tx === "y") ox = "x";
    var data = {};
    var value;
    for (var i = 0; i < arr[tx].length; i++) {
      value = this.roundFactor(arr[tx][i], factor).getTime();
      if (value in data) {
        data[value].push(arr[ox][i]);
      } else {
        data[value] = [arr[ox][i]];
      }
    }
    var arrDict = [];
    for (var key in data) {
      arrDict.push({
        [tx]: new Date(parseInt(key)),
        [ox]: this.average(data[key]),
      });
    }
    arrDict.sort((a, b) => (a[tx] > b[tx] ? 1 : b[tx] > a[tx] ? -1 : 0));
    var x = [];
    var y = [];
    for (var k = 0; k < arrDict.length; k++) {
      x.push(arrDict[k].x);
      y.push(arrDict[k].y);
    }
    return { x, y, z: undefined };
  };

  average2D = (arr, factor, tx, bounds) => {
    var ox = "y";
    var data = {};
    var arrDict = [];
    var value, x, y, z;
    if (tx === "x") {
      for (let i = 0; i < arr[tx].length; i++) {
        value = this.roundFactor(arr[tx][i], factor).getTime();
        if (value in data) {
          for (let j = 0; j < arr[ox].length; j++) {
            data[value][j].push(arr.z[j][i]);
          }
        } else {
          data[value] = [];
          for (let j = 0; j < arr[ox].length; j++) {
            data[value].push([arr.z[j][i]]);
          }
        }
      }
      for (let key in data) {
        arrDict.push({
          [tx]: new Date(parseInt(key)),
          z: data[key].map((d) => this.average(d)),
        });
      }
      arrDict.sort((a, b) => (a[tx] > b[tx] ? 1 : b[tx] > a[tx] ? -1 : 0));
      x = [];
      y = arr[ox];
      z = [...Array(y.length)].map((x) => []);
      for (let i = 0; i < arrDict.length; i++) {
        x.push(arrDict[i].x);
        for (let j = 0; j < arr[ox].length; j++) {
          z[j].push(arrDict[i].z[j]);
        }
      }
      return { x, y, z };
    } else if (tx === "y") {
      ox = "x";
      for (let i = 0; i < arr[tx].length; i++) {
        value = this.roundFactor(arr[tx][i], factor).getTime();
        if (value in data) {
          data[value].push(arr.z[i]);
        } else {
          data[value] = [arr.z[i]];
        }
      }
      for (let key in data) {
        let zz = [];
        for (let i = 0; i < arr[ox].length; i++) {
          let zt = [];
          for (let j = 0; j < data[key].length; j++) {
            zt.push(data[key][j][i]);
          }
          zz.push(this.average(zt));
        }
        arrDict.push({
          [tx]: new Date(parseInt(key)),
          z: zz,
        });
      }
      arrDict.sort((a, b) => (a[tx] > b[tx] ? 1 : b[tx] > a[tx] ? -1 : 0));
      x = arr[ox];
      y = [];
      z = [];
      for (let i = 0; i < arrDict.length; i++) {
        y.push(arrDict[i].y);
        z.push(arrDict[i].z);
      }
      return { x, y, z };
    } else {
      return arr;
    }
  };

  averageData = (plotdata, timeaxis, average, graph, bounds) => {
    var out;
    if ((plotdata && ["x", "y"].includes(timeaxis), average !== "None")) {
      if (graph === "linegraph") {
        if (Array.isArray(plotdata)) {
          out = [];
          for (let i = 0; i < plotdata.length; i++) {
            out.push(this.average1D(plotdata[i], average, timeaxis));
          }
        } else {
          out = this.average1D(plotdata, average, timeaxis);
        }
        return out;
      } else if (graph === "heatmap") {
        if (Array.isArray(plotdata)) {
          out = [];
          for (let i = 0; i < plotdata.length; i++) {
            out.push(this.average2D(plotdata[i], average, timeaxis, bounds));
          }
        } else {
          out = this.average2D(plotdata, average, timeaxis, bounds);
        }
        return out;
      } else {
        return plotdata;
      }
    } else {
      return plotdata;
    }
  };

  decimate1D = (arr, factor) => {
    var x = [];
    var y = [];
    for (let i = 0; i < arr.x.length; i = i + factor) {
      if (arr.x[i]) {
        x.push(arr.x[i]);
        y.push(arr.y[i]);
      }
    }
    return { x, y, z: undefined };
  };

  decimate2D = (arr, factor, timeaxis) => {
    var x, y, z;
    if (timeaxis === "x") {
      y = arr.y;
      x = [];
      z = [...Array(arr.y.length)].map((x) => []);
      for (let i = 0; i < arr.x.length; i = i + factor) {
        if (arr.x[i]) {
          x.push(arr.x[i]);
          for (let j = 0; j < arr.y.length; j++) {
            z[j].push(arr.z[j][i]);
          }
        }
      }
      return { x, y, z };
    } else if (timeaxis === "y") {
      x = arr.x;
      y = [];
      z = [];
      for (let i = 0; i < arr.y.length; i = i + factor) {
        if (arr.y[i]) {
          y.push(arr.y[i]);
          z.push(arr.z[i]);
        }
      }
      return { x, y, z };
    } else {
      return arr;
    }
  };

  decimateData = (plotdata, timeaxis, decimate, graph) => {
    var out;
    if (decimate > 1 && isInteger(decimate) && plotdata) {
      if (graph === "linegraph") {
        if (Array.isArray(plotdata)) {
          out = [];
          for (let i = 0; i < plotdata.length; i++) {
            out.push(this.decimate1D(plotdata[i], decimate));
          }
        } else {
          out = this.decimate1D(plotdata, decimate);
        }
        return out;
      } else if (graph === "heatmap") {
        if (Array.isArray(plotdata)) {
          out = [];
          for (let i = 0; i < plotdata.length; i++) {
            out.push(this.decimate2D(plotdata[i], decimate, timeaxis));
          }
        } else {
          out = this.decimate2D(plotdata, decimate, timeaxis);
        }
        return out;
      } else {
        return plotdata;
      }
    } else {
      return plotdata;
    }
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

    var z;
    if (data.z) {
      z = [];
      for (var j = 0; j < data.y.length; j++) {
        z.push(data.z[j].slice(l, u));
      }
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
      if (data.y[i] > upper + 0.01 && u === data.y.length - 1) {
        u = i;
      }
    }
    var y = data.y.slice(l, u);
    var x = data.x;

    var z;
    if (data.z) {
      z = [];
      for (var j = 0; j < data.y.length; j++) {
        if (j >= l && j <= u) {
          z.push(data.z[j]);
        }
      }
    }

    if (y.length > 0) {
      return { x: x, y: y, z: z };
    } else {
      return false;
    }
  };

  sliceXYArray = (data, lowerX, upperX, lowerY, upperY) => {
    var x = [];
    var y = [];
    for (var i = 0; i < data.x.length; i++) {
      if (
        data.x[i] >= lowerX &&
        data.x[i] <= upperX &&
        data.y[i] >= lowerY &&
        data.y[i] <= upperY
      ) {
        x.push(data.x[i]);
        y.push(data.y[i]);
      }
    }
    return { x, y, z: undefined };
  };

  sliceData = (
    plotdata,
    graph,
    upperX,
    lowerX,
    upperY,
    lowerY,
    minX,
    maxX,
    minY,
    maxY,
    connect
  ) => {
    if (connect === "ind") {
      return plotdata;
    } else if (graph === "linegraph") {
      if (Array.isArray(plotdata)) {
        var dataout = [];
        for (let i = 0; i < plotdata.length; i++) {
          let slice = this.sliceXYArray(
            plotdata[i],
            lowerX,
            upperX,
            lowerY,
            upperY
          );
          if (slice) dataout.push(slice);
        }
        plotdata = dataout;
      } else {
        plotdata = this.sliceXYArray(plotdata, lowerX, upperX, lowerY, upperY);
      }
      return plotdata;
    } else if (graph === "heatmap") {
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
            let slice = this.sliceYArray(plotdata[i], lowerY, upperY);
            if (slice) dataoutY.push(slice);
          }
          plotdata = dataoutY;
        } else {
          plotdata = this.sliceYArray(plotdata, lowerY, upperY);
        }
      }
      return plotdata;
    } else {
      return plotdata;
    }
  };

  addGaps = (obj, timeaxis, gap) => {
    if (timeaxis === "x" && obj) {
      if (!Array.isArray(obj)) obj = [obj];
      for (let i = 0; i < obj.length; i++) {
        for (let j = 1; j < obj[i].x.length; j++) {
          if (
            obj[i].x[j].getTime() - obj[i].x[j - 1].getTime() >
            gap * 60 * 60 * 1000
          ) {
            obj[i].x.splice(
              j,
              0,
              new Date(obj[i].x[j - 1].getTime() + 60 * 1000)
            );
            obj[i].z.map((z) => z.splice(j, 0, null));
            obj[i].x.splice(
              j + 1,
              0,
              new Date(obj[i].x[j + 1].getTime() - 60 * 1000)
            );
            obj[i].z.map((z) => z.splice(j + 1, 0, null));
            j = j + 2;
          }
        }
      }
      return obj;
    } else if (timeaxis === "y" && obj) {
      if (!Array.isArray(obj)) obj = [obj];
      for (let i = 0; i < obj.length; i++) {
        for (let j = 1; j < obj[i].y.length; j++) {
          if (
            obj[i].y[j].getTime() - obj[i].y[j - 1].getTime() >
            gap * 60 * 60 * 1000
          ) {
            obj[i].y.splice(
              j,
              0,
              new Date(obj[i].y[j - 1].getTime() + 60 * 1000)
            );
            obj[i].z.splice(j, 0, Array(obj[i].x.length).fill(null));
            obj[i].y.splice(
              j + 1,
              0,
              new Date(obj[i].y[j + 1].getTime() - 60 * 1000)
            );
            obj[i].z.splice(j, 0, Array(obj[i].x.length).fill(null));
            j = j + 2;
          }
        }
      }
      return obj;
    } else {
      return obj;
    }
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
    decimate,
    average,
    datasetparameters,
    timeaxis,
    graph
  ) => {
    var { mask, gap } = this.state;
    var { data, files, file } = this.props;
    var plotdata = this.selectAxisAndMask(
      files,
      data,
      file,
      xaxis,
      yaxis,
      zaxis,
      datasetparameters,
      mask
    );

    plotdata = this.joinData(plotdata, graph, files[file[0]].connect, timeaxis);

    try {
      plotdata = this.sliceData(
        plotdata,
        graph,
        upperX,
        lowerX,
        upperY,
        lowerY,
        minX,
        maxX,
        minY,
        maxY,
        files[file[0]].connect
      );
    } catch (e) {
      console.error(e);
    }

    try {
      plotdata = this.decimateData(plotdata, timeaxis, decimate, graph);
    } catch (e) {
      console.error(e);
    }
    try {
      plotdata = this.formatTime(plotdata, datasetparameters, xaxis, yaxis);
      try {
        plotdata = this.averageData(plotdata, timeaxis, average, graph, {
          lowerX,
          lowerY,
          upperX,
          upperY,
        });
      } catch (e) {
        console.error(e);
      }
    } catch (e) {
      console.error(e);
    }

    try {
      plotdata = this.addGaps(plotdata, timeaxis, gap);
    } catch (e) {
      console.error(e);
    }

    return plotdata;
  };

  getInitialBounds = (dataset, data, file, xaxis, yaxis) => {
    var { maxdatetime, mindatetime, datasetparameters } = this.props;

    var timeaxis = "";
    const xparam = datasetparameters.find((x) => x.axis === xaxis);
    const yparam = datasetparameters.find((y) => y.axis === yaxis);
    if (xparam.parameters_id === 1) timeaxis = "x";
    if (yparam.parameters_id === 1) timeaxis = "y";

    const title = dataset.title;
    var colors = this.parseColor(dataset.plotproperties.colors);
    var zdomain = d3.extent(
      [].concat.apply([], data[file[0]].z).filter((f) => {
        return !isNaN(parseFloat(f)) && isFinite(f);
      })
    );
    var ydomain = d3.extent(
      [].concat.apply([], data[file[0]].y).filter((f) => {
        return !isNaN(parseFloat(f)) && isFinite(f);
      })
    );
    var xdomain = d3.extent(
      [].concat.apply([], data[file[0]].x).filter((f) => {
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

    return {
      title,
      colors,
      minZ,
      maxZ,
      minY,
      maxY,
      minX,
      maxX,
      lowerY,
      upperY,
      lowerX,
      upperX,
      lowerZ,
      upperZ,
      timeaxis,
    };
  };

  getZBounds = (plotdata) => {
    var minZ = Infinity;
    var maxZ = -Infinity;
    var pd = plotdata;
    if (!isArray(plotdata)) {
      pd = [pd];
    }
    for (var i = 0; i < pd.length; i++) {
      let zdomain = d3.extent(
        [].concat.apply([], pd[i].z).filter((f) => {
          return !isNaN(parseFloat(f)) && isFinite(f);
        })
      );
      minZ = Math.min(zdomain[0], minZ);
      maxZ = Math.max(zdomain[1], maxZ);
    }
    return { minZ, maxZ };
  };

  getBounds = (data, xaxis, yaxis, timeaxis) => {
    var { maxdatetime, mindatetime } = this.props;
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    for (var i = 0; i < data.length; i++) {
      if (data[i] !== 0) {
        let xdomain = d3.extent(
          [].concat.apply([], data[i][xaxis]).filter((f) => {
            return !isNaN(parseFloat(f)) && isFinite(f);
          })
        );
        let ydomain = d3.extent(
          [].concat.apply([], data[i][yaxis]).filter((f) => {
            return !isNaN(parseFloat(f)) && isFinite(f);
          })
        );
        minX = Math.min(xdomain[0], minX);
        maxX = Math.max(xdomain[1], maxX);
        minY = Math.min(ydomain[0], minY);
        maxY = Math.max(ydomain[1], maxY);
      }
    }

    if (timeaxis === "x" && maxdatetime && mindatetime) {
      minX = Math.min(minX, mindatetime);
      maxX = Math.max(maxX, maxdatetime);
    }

    if (timeaxis === "y" && maxdatetime && mindatetime) {
      minY = Math.min(minY, mindatetime);
      maxY = Math.max(maxY, maxdatetime);
    }

    return { minX, maxX, minY, maxY };
  };

  componentDidMount() {
    var { datasetparameters, dataset, file, data } = this.props;
    var { xaxis, yaxis, zaxis, decimate, average } = this.state;

    var {
      xoptions,
      yoptions,
      zoptions,
      graph,
      yReverse,
      xReverse,
    } = this.setAxisOptions(datasetparameters, xaxis, yaxis, zaxis);

    var { xlabel, ylabel, zlabel, xunits, yunits, zunits } = this.getAxisLabels(
      datasetparameters,
      xaxis,
      yaxis,
      zaxis
    );

    var {
      title,
      colors,
      minZ,
      maxZ,
      minY,
      maxY,
      minX,
      maxX,
      lowerY,
      upperY,
      lowerX,
      upperX,
      lowerZ,
      upperZ,
      timeaxis,
    } = this.getInitialBounds(dataset, data, file, xaxis, yaxis);

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
      decimate,
      average,
      datasetparameters,
      timeaxis,
      graph
    );

    this.setState({
      plotdata,
      xoptions,
      yoptions,
      zoptions,
      graph,
      xlabel,
      ylabel,
      zlabel,
      xunits,
      yunits,
      zunits,
      yReverse,
      xReverse,
      title,
      colors,
      minZ,
      maxZ,
      minY,
      maxY,
      minX,
      maxX,
      lowerY,
      upperY,
      lowerX,
      upperX,
      lowerZ,
      upperZ,
      timeaxis,
    });
  }

  componentDidUpdate(prevProps) {
    var {
      refresh,
      timeaxis,
      upperY,
      lowerY,
      upperX,
      lowerX,
      xaxis,
      yaxis,
      zaxis,
    } = this.state;
    if (refresh || this.props.fileChange !== prevProps.fileChange) {
      var { minX, maxX, minY, maxY } = this.getBounds(
        this.props.data,
        xaxis,
        yaxis,
        timeaxis
      );

      // Reset upper and lower values
      if (timeaxis === "x") {
        upperY = maxY;
        lowerY = minY;
      } else if (timeaxis === "y") {
        upperX = maxX;
        lowerX = minX;
      } else {
        upperX = maxX;
        lowerX = minX;
        upperY = maxY;
        lowerY = minY;
      }

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
        this.state.decimate,
        this.state.average,
        this.props.datasetparameters,
        timeaxis,
        this.state.graph
      );
      var { minZ, maxZ } = this.state;
      if (refresh !== "z") {
        ({ minZ, maxZ } = this.getZBounds(plotdata));
      }

      this.setState({
        plotdata,
        refresh: false,
        minZ,
        maxZ,
        minX,
        maxX,
        minY,
        maxY,
        upperX,
        upperY,
        lowerX,
        lowerY,
      });
    }
  }

  render() {
    return (
      <React.Fragment>
        <SidebarLayout
          sidebartitle="Plot Controls"
          left={
            <React.Fragment>
              <div className="detailloading" id="detailloading">
                <Loading />
                Downloading extra files.
              </div>
              <div className="detailgraph">
                <Graph {...this.state} {...this.props} />
              </div>
            </React.Fragment>
          }
          rightNoScroll={
            <Sidebar
              {...this.state}
              {...this.props}
              onChangeState={this.onChangeState}
              onChangeFile={this.onChangeFile}
              onChangeX={this.onChangeX}
              onChangeY={this.onChangeY}
              toggleAddNewFile={this.toggleAddNewFile}
              handleAxisSelect={this.handleAxisSelect}
            />
          }
        />
      </React.Fragment>
    );
  }
}

export default Plot;
