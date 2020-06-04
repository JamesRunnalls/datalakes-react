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
    plotdata: {},
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
    this.setState({
      profile: !this.state.profile,
      timeline: false,
      slice: false,
      menu: false,
      help: false,
      line: false,
      point: !this.state.profile,
    });
  };

  toggleTimeline = () => {
    this.setState({
      timeline: !this.state.timeline,
      slice: false,
      menu: false,
      help: false,
      profile: false,
      line: false,
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

  updatePoint = async (pointValue) => {
    var graph = "linegraph";
    var { data: plotdata } = await axios
      .get(
        apiUrl +
          "/externaldata/meteolakes/depthprofile/zurich/temperature/737873/697139/230954"
      )
      .catch((error) => {
        this.setState({ pointValue });
      });
    this.setState({ pointValue, graph, plotdata });
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
    layer["colors"] = this.parseColor(layer["colors"]);

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
      zoomIn,
      zoomOut,
    } = this.state;
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
          {graph === "linegraph" && (
            <D3LineGraph
              data={plotdata}
              title={"Title"}
              xlabel={"xlabel"}
              ylabel={"ylabel"}
              xunits={"xunits"}
              yunits={"yunits"}
              lcolor={"black"}
              lweight={"1"}
              bcolor={"white"}
              xscale={"linear"}
              yscale={"linear"}
            />
          )}
        </div>
      </div>
    );
  }
}

export default ThreeDModel;
