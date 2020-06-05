import React, { Component } from "react";
import axios from "axios";
import "../datadetail.css";
import Basemap from "../../../graphs/leaflet/basemap";
import "../threed.css";
import Loading from "../../../components/loading/loading";
import MapControl from "../../../components/mapcontrol/mapcontrol";
import menuicon from "../img/menuicon.svg";
import sliceicon from "../img/sliceicon.svg";
import timeicon from "../img/timeicon.svg";
import profileicon from "../img/profileicon.svg";
import colorlist from "../../../components/colorramp/colors";
import { apiUrl } from "../../../../src/config.json";
import D3LineGraph from "../../../graphs/d3/linegraph/linegraph";
import D3HeatMap from "../../../graphs/d3/heatmap/heatmap";

class ThreeDModel extends Component {
  state = {
    selectedlayers: [],
    datasets: [],
    profile: false,
    timeline: false,
    slice: false,
    menu: false,
    fullsize: false,
    help: false,
    point: false,
    pointValue: {},
    line: false,
    lineValue: [],
    loading: true,
    graph: "none",
    colors: [
      { color: "#0000ff", point: 0 },
      { color: "#ff0000", point: 1 },
    ],
    plotdata: { x: [], y: [], z: [] },
    zoomIn: () => {},
    zoomOut: () => {},
  };

  setZoomIn = (newFunc) => {
    this.setState({ zoomIn: newFunc });
  };

  setZoomOut = (newFunc) => {
    this.setState({ zoomOut: newFunc });
  };

  toggleHelp = () => {
    this.setState({
      help: !this.state.help,
      menu: false,
    });
  };

  toggleMenu = () => {
    this.setState({
      menu: !this.state.menu,
      help: false,
    });
  };

  toggleProfile = () => {
    var { profile, graph, plotdata } = this.state;
    if (profile && graph === "depthgraph") {
      graph = "none";
    } else {
      graph = "depthgraph";
    }
    plotdata = { x: [], y: [], z: [] };
    this.setState({
      profile: !profile,
      timeline: false,
      slice: false,
      menu: false,
      help: false,
      line: false,
      graph,
      plotdata,
      point: !profile,
    });
  };

  toggleTimeline = () => {
    var { timeline, graph, plotdata } = this.state;
    if (timeline && graph === "timegraph") {
      graph = "none";
    } else {
      graph = "timegraph";
    }
    plotdata = { x: [], y: [], z: [] };
    this.setState({
      timeline: !this.state.timeline,
      slice: false,
      menu: false,
      help: false,
      profile: false,
      line: false,
      graph,
      plotdata,
      point: !this.state.timeline,
    });
  };

  toggleSlice = () => {
    this.setState({
      slice: !this.state.slice,
      timeline: false,
      menu: false,
      help: false,
      profile: false,
      point: false,
      line: !this.state.slice,
    });
  };

  removeNaN = (data) => {
    var keys = Object.keys(data);
    var var1 = [];
    var var2 = [];
    for (var i = 0; i < data[keys[0]].length; i++) {
      if (
        !isNaN(parseInt(data[keys[0]][i])) &&
        !isNaN(parseInt(data[keys[1]][i]))
      ) {
        var1.push(data[keys[0]][i]);
        var2.push(data[keys[1]][i]);
      }
    }
    var out = { [keys[0]]: var1, [keys[1]]: var2 };
    return out;
  };

  matlabToJavascriptDatetime = (date) => {
    return new Date((date - 719529) * 24 * 60 * 60 * 1000);
  };

  javascriptDatetimeToMatlab = (date) => {
    return 719529 + date.getTime() / (24 * 60 * 60 * 1000);
  };

  CHtoWGSlatlng = (yx) => {
    var y_aux = (yx[0] - 600000) / 1000000;
    var x_aux = (yx[1] - 200000) / 1000000;
    var lat =
      16.9023892 +
      3.238272 * x_aux -
      0.270978 * Math.pow(y_aux, 2) -
      0.002528 * Math.pow(x_aux, 2) -
      0.0447 * Math.pow(y_aux, 2) * x_aux -
      0.014 * Math.pow(x_aux, 3);
    var lng =
      2.6779094 +
      4.728982 * y_aux +
      0.791484 * y_aux * x_aux +
      0.1306 * y_aux * Math.pow(x_aux, 2) -
      0.0436 * Math.pow(y_aux, 3);
    lat = (lat * 100) / 36;
    lng = (lng * 100) / 36;

    return [lat, lng];
  };

  WGSlatlngtoCH = (lat, lng) => {
    lat = lat * 3600;
    lng = lng * 3600;
    var lat_aux = (lat - 169028.66) / 10000;
    var lng_aux = (lng - 26782.5) / 10000;
    var y =
      2600072.37 +
      211455.93 * lng_aux -
      10938.51 * lng_aux * lat_aux -
      0.36 * lng_aux * lat_aux ** 2 -
      44.54 * lng_aux ** 3 -
      2000000;
    var x =
      1200147.07 +
      308807.95 * lat_aux +
      3745.25 * lng_aux ** 2 +
      76.63 * lat_aux ** 2 -
      194.56 * lng_aux ** 2 * lat_aux +
      119.79 * lat_aux ** 3 -
      1000000;
    return { x, y };
  };

  updatePoint = async (pointValue) => {
    var { graph, time } = this.state;
    if (graph === "depthgraph") {
      // Convert to meteolakes units
      var t = this.javascriptDatetimeToMatlab(time);
      var { x, y } = this.WGSlatlngtoCH(pointValue.lat, pointValue.lng);
      axios
        .get(
          apiUrl +
            `/externaldata/meteolakes/depthprofile/zurich/water_temperature/${t}/${x}/${y}`
        )
        .then((response) => {
          var plotdata = this.removeNaN(response.data);
          this.setState({ pointValue, plotdata });
        })
        .catch((error) => {
          this.setState({ pointValue, plotdata: { x: [], y: [], z: [] } });
        });
    } else if (graph === "timegraph") {
      // Convert to meteolakes units
      ({ x, y } = this.WGSlatlngtoCH(pointValue.lat, pointValue.lng));
      axios
        .get(
          apiUrl +
            `/externaldata/meteolakes/timeline/zurich/water_temperature/12/${x}/${y}`
        )
        .then((response) => {
          var { x, y, z } = response.data;
          x = x.map((i) => new Date(i * 1000));
          var plotdata = { x, y, z };
          this.setState({ pointValue, plotdata });
        })
        .catch((error) => {
          this.setState({ pointValue, plotdata: { x: [], y: [], z: [] } });
        });
    }
  };

  updateLine = (lineValue) => {
    this.setState({ lineValue });
  };

  meteolakesScalarMinMax = (inarray) => {
    var min = Infinity;
    var max = -Infinity;
    var flat = inarray.flat();
    flat = flat.filter((item) => item !== null);
    flat = flat.map((item) => item[2]);
    min = Math.min(min, this.getMin(flat));
    max = Math.max(max, this.getMax(flat));
    return { min, max, array: flat };
  };

  meteolakesVectorMinMax = (inarray) => {
    var min = Infinity;
    var max = -Infinity;
    var flat = inarray.flat();
    flat = flat.filter((item) => item !== null);
    flat = flat.map((item) =>
      Math.abs(Math.sqrt(Math.pow(item[2], 2) + Math.pow(item[3], 2)))
    );
    min = Math.min(min, this.getMin(flat));
    max = Math.max(max, this.getMax(flat));
    return { min, max, array: flat };
  };

  getMax = (arr) => {
    let len = arr.length;
    let max = -Infinity;

    while (len--) {
      max = arr[len] > max ? arr[len] : max;
    }
    return max;
  };

  getMin = (arr) => {
    let len = arr.length;
    let min = Infinity;

    while (len--) {
      min = arr[len] < min ? arr[len] : min;
    }
    return min;
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

  parseBoolean = (bool) => {
    if (bool === "true") {
      return true;
    } else {
      return false;
    }
  };

  addNewLayer = () => {};

  async componentDidMount() {
    var { files, dataset } = this.props;
    var layer = {
      visible: true,
      dataset_index: 0,
    };
    layer = { ...layer, ...dataset.plotproperties };
    var colors = this.parseColor(layer["colors"]);
    layer["colors"] = colors;

    var depths = [
      ...new Set(files.map((item) => parseFloat(item.mindepth))),
    ].sort(function (a, b) {
      return a - b;
    });
    var times = [...new Set(files.map((item) => item.mindatetime))];
    times = times
      .map((t) => new Date(t))
      .sort(function (a, b) {
        return b - a;
      });
    var depth = depths[0];
    var time = times[times.length - 1];

    var fileIndex = files.findIndex(
      (f) =>
        f.mindepth === String(depth) && f.mindatetime === time.toISOString()
    );
    layer["fileid"] = files[fileIndex].id;
    var { data } = await axios.get(files[fileIndex].filelink).catch((error) => {
      console.log(error);
    });

    var min, max, array;
    if (dataset.mapplotfunction === "meteolakesVector") {
      ({ min, max, array } = this.meteolakesVectorMinMax(data));
    } else {
      ({ min, max, array } = this.meteolakesScalarMinMax(data));
    }
    layer["min"] = min;
    layer["max"] = max;
    layer["array"] = array;

    files[fileIndex]["data"] = data;
    dataset["files"] = files;
    var selectedlayers = [layer];
    var datasets = [dataset];
    this.setState({
      loading: false,
      colors,
      depths,
      times,
      depth,
      time,
      datasets,
      selectedlayers,
    });
  }

  render() {
    var {
      selectedlayers,
      datasets,
      menu,
      profile,
      timeline,
      slice,
      fullsize,
      help,
      point,
      line,
      loading,
      graph,
      plotdata,
      colors,
      zoomIn,
      zoomOut,
    } = this.state;
    var { dataset } = this.props;
    var controls = [
      { title: "Menu", active: menu, onClick: this.toggleMenu, img: menuicon },
      {
        title: "Depth Profile",
        active: profile,
        onClick: this.toggleProfile,
        img: profileicon,
      },
      {
        title: "Time Series",
        active: timeline,
        onClick: this.toggleTimeline,
        img: timeicon,
      },
      {
        title: "Transect",
        active: slice,
        onClick: this.toggleSlice,
        img: sliceicon,
      },
    ];

    return (
      <div className="threed">
        <div className="basemapwrapper">
          <div className="controls">
            <MapControl
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              fullsize={fullsize}
              controls={controls}
              help={help}
              toggleHelp={this.toggleHelp}
            />
          </div>
          <Basemap
            selectedlayers={selectedlayers}
            datasets={datasets}
            setZoomIn={this.setZoomIn}
            setZoomOut={this.setZoomOut}
            point={point}
            line={line}
            updatePoint={this.updatePoint}
            updateLine={this.updateLine}
            loading={loading}
          />
          {loading && (
            <div className="map-loader">
              <Loading />
              Downloading and plotting data
            </div>
          )}
        </div>
        <div className="graphwrapper">
          {graph === "depthgraph" && (
            <D3LineGraph
              data={plotdata}
              title={`${dataset.title} Depth Profile`}
              xlabel={"Temperature"}
              ylabel={"Depth"}
              xunits={"°C"}
              yunits={"m"}
              lcolor={"#000000"}
              lweight={"1"}
              bcolor={"white"}
              xscale={"Linear"}
              yscale={"Linear"}
            />
          )}
          {graph === "timegraph" && (
            <D3HeatMap
              data={plotdata}
              title={`${dataset.title} Timeline`}
              xlabel={"Time"}
              ylabel={"Depth"}
              zlabel={"Temperature"}
              xunits={""}
              yunits={"m"}
              zunits={"°C"}
              bcolor={"white"}
              colors={colors}
            />
          )}
        </div>
      </div>
    );
  }
}

export default ThreeDModel;
