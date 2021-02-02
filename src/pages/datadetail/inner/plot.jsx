import React, { Component } from "react";
import * as d3 from "d3";
import SidebarLayout from "../../../format/sidebarlayout/sidebarlayout";
import DataSelect from "../../../components/dataselect/dataselect";
import Loading from "../../../components/loading/loading";
import D3HeatMap from "../../../graphs/d3/heatmap/heatmap";
import D3LineGraph from "../../../graphs/d3/linegraph/linegraph";
import FilterBox from "../../../components/filterbox/filterbox";
import colorlist from "../../../components/colorramp/colors";
import { isArray, isEqual } from "lodash";

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
      legend,
      confidence,
      lcolor,
      lweight,
      xscale,
      yscale,
      xReverse,
      yReverse,
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
  state = {};
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
    lcolor: ["black"],
    lweight: ["0.5"],
    xscale: "Linear",
    yscale: "Linear",
    decimate_active: false,
    decimate_period: 24,
    decimate_time: "12:00",
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

  setAxisOptions = (datasetparameters, xaxis, yaxis, zaxis) => {
    var xoptions = [];
    var yoptions = [];
    var zoptions = [];
    var graph = "linegraph";
    var xdp = datasetparameters.find((dp) => dp.axis === xaxis);
    var ydp = datasetparameters.find((dp) => dp.axis === yaxis);
    var yReverse = false;
    var xReverse = false;
    if ([2, 18].includes(xdp.parameters_id)) xReverse = true;
    if ([2, 18].includes(ydp.parameters_id)) yReverse = true;
    for (var j = 0; j < datasetparameters.length; j++) {
      if (datasetparameters[j]["axis"].includes("x")) {
        xoptions.push({
          value: datasetparameters[j]["axis"],
          label: datasetparameters[j]["name"],
        });
      } else if (datasetparameters[j]["axis"].includes("y")) {
        yoptions.push({
          value: datasetparameters[j]["axis"],
          label: datasetparameters[j]["name"],
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
          label: datasetparameters[j]["name"],
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
    var {
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
      decimate_active,
      decimate_period,
      decimate_time,
    } = this.state;
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
      decimate_active,
      decimate_period,
      decimate_time,
      datasetparameters
    );
    this.setState({
      plotdata,
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
    });
  };

  combineFiles = (files, combined, data, file, xaxis, yaxis, zaxis) => {
    var plotdata;
    if (files[file[0]].connect === "join") {
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
    } else if (files[file[0]].connect === "ind") {
      plotdata = {
        x: data[file[0]][xaxis],
        y: data[file[0]][yaxis],
        z: data[file[0]][zaxis],
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

  formatTime = (plotdata, datasetparameters, xaxis, yaxis) => {
    var xdp = datasetparameters.find((dp) => dp.axis === xaxis);
    var ydp = datasetparameters.find((dp) => dp.axis === yaxis);

    if (xdp.parameters_id === 1) {
      if (isArray(plotdata)) {
        for (let i = 0; i < plotdata.length; i++) {
          plotdata[i].x = plotdata[i].x.map((pdx) => new Date(pdx));
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
        plotdata.y = plotdata.y.map((pdy) => new Date(pdy));
      }
    }
    return plotdata;
  };

  decimateData = (obj, timeaxis, active, period, time) => {
    if (active && timeaxis === "x" && obj) {
      console.log(obj);
      if (!Array.isArray(obj)) obj = [obj];
      let { lowerX, upperX } = this.state;
      let hour = time.split(":")[0];
      let min = time.split(":")[1];
      let minDate =
        new Date(lowerX * 1000).setHours(parseInt(hour), parseInt(min)) / 1000;
      let steps = Math.floor((upperX - minDate) / (period * 3600));
      let date_list = [];
      let k = 0;
      let out = [
        { x: [], y: obj[0].y, z: Array.from(Array(obj[0].y.length), () => []) },
      ];
      for (let i = 0; i < obj.length; i++) {
        if (!isEqual(out[out.length - 1].y, obj[i].y)) {
          k++;
          out.push({
            x: [],
            y: obj[i].y,
            z: Array.from(Array(obj[i].y.length), () => []),
          });
        }
        for (let j = 0; j < obj[i].x.length; j++) {
          date_list.push([obj[i].x[j], i, j, k]);
        }
      }
      for (let i = 0; i < steps; i++) {
        let dt = minDate + i * period * 3600;
        let close = this.closest(dt, date_list);
        for (let j = 0; j < obj[close[1]].y.length; j++) {
          out[close[3]].z[j].push(obj[close[1]].z[j][close[2]]);
        }
        out[close[3]].x.push(obj[close[1]].x[close[2]]);
      }
      return out;
    } else if (active && timeaxis === "y" && obj) {
      if (!Array.isArray(obj)) obj = [obj];
      let { lowerY, upperY } = this.state;
      let hour = time.split(":")[0];
      let min = time.split(":")[1];
      let minDate =
        new Date(lowerY * 1000).setHours(parseInt(hour), parseInt(min)) / 1000;
      let steps = Math.floor((upperY - minDate) / (period * 3600));
      let date_list = [];
      let k = 0;
      let out = [{ x: obj[0].x, y: [], z: [] }];
      for (let i = 0; i < obj.length; i++) {
        if (!isEqual(out[out.length - 1].x, obj[i].x)) {
          k++;
          out.push({ x: obj[i].x, y: [], z: [] });
        }
        for (let j = 0; j < obj[i].y.length; j++) {
          date_list.push([obj[i].y[j], i, j, k]);
        }
      }
      for (let i = 0; i < steps; i++) {
        let dt = minDate + i * period * 3600;
        let close = this.closest(dt, date_list);
        out[close[3]].z.push(obj[close[1]].z[close[2]]);
        out[close[3]].y.push(obj[close[1]].y[close[2]]);
      }
      return out;
    } else {
      return obj;
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

    var z = [];
    for (var j = 0; j < data.y.length; j++) {
      z.push(data.z[j].slice(l, u));
    }
    if (x.length > 0) {
      return { x: x, y: y, z: z };
    } else {
      return data;
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
    decimate_active,
    decimate_period,
    decimate_time,
    datasetparameters
  ) => {
    var { data, files, file, combined } = this.props;
    var timeaxis = "";
    const xparam = datasetparameters.find((x) => x.axis === xaxis);
    const yparam = datasetparameters.find((y) => y.axis === yaxis);
    if (xparam.parameters_id === 1) timeaxis = "x";
    if (yparam.parameters_id === 1) timeaxis = "y";

    var plotdata = this.combineFiles(
      files,
      combined,
      data,
      file,
      xaxis,
      yaxis,
      zaxis
    );

    plotdata = this.formatTime(plotdata, datasetparameters, xaxis, yaxis);

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

      plotdata = this.decimateData(
        plotdata,
        timeaxis,
        decimate_active,
        decimate_period,
        decimate_time
      );

      var { gap } = this.state;
      if (decimate_active) gap = 1.1 * decimate_period;

      plotdata = this.addGaps(plotdata, timeaxis, gap);
    } catch (e) {
      console.error(e);
    }

    return plotdata;
  };

  getInitialBounds = (dataset, data, file) => {
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
    };
  };

  componentDidMount() {
    var { datasetparameters, dataset, file, data } = this.props;
    var { xaxis, yaxis, zaxis } = this.state;

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
      decimate_active,
      decimate_period,
      decimate_time,
    } = this.getInitialBounds(dataset, data, file);

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
      decimate_active,
      decimate_period,
      decimate_time,
      datasetparameters
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
    });
  }

  render() {
    return (
      <React.Fragment>
        <SidebarLayout
          sidebartitle="Plot Controls"
          left={
            <div className="detailgraph">
              <Graph {...this.state} {...this.props} />
            </div>
          }
          rightNoScroll={
            <Sidebar {...this.state} handleAxisSelect={this.handleAxisSelect} />
          }
        />
      </React.Fragment>
    );
  }
}

export default Plot;
