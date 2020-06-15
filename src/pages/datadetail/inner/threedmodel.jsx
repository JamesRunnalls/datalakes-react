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
import FilterBox from "../../../components/filterbox/filterbox";
import MapMenu from "../../../components/mapmenu/mapmenu";
import MapLayers from "../../../components/maplayers/maplayers";
import Legend from "../../../components/legend/legend";
import DatetimeDepthSelector from "../../../components/sliders/datetimedepthselector";

class ThreeDMenu extends Component {
  render() {
    var {
      basemap,
      updateBaseMap,
      selectedlayers,
      toggleLayerView,
      updateMapLayers,
    } = this.props;
    return (
      <React.Fragment>
        <FilterBox
          title="Basemap"
          preopen="true"
          content={
            <div className="basemap">
              <select
                className="basemapselector"
                onChange={updateBaseMap}
                value={basemap}
                title="Edit the background map style"
              >
                <option value="datalakesmap">Datalakes Map</option>
                <option value="swisstopo">Swisstopo</option>
                <option value="satellite">Satellite</option>
              </select>
            </div>
          }
        />
        <FilterBox
          title="Map Layers"
          preopen="true"
          content={
            <MapLayers
              selectedlayers={selectedlayers}
              toggleLayerView={toggleLayerView}
              updateMapLayers={updateMapLayers}
            />
          }
        />
      </React.Fragment>
    );
  }
}

class ThreeDModel extends Component {
  state = {
    time: new Date(),
    depth: 0,
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
    basemap: "datalakesmap",
    graph: "none",
    parameter: "Temperature",
    colors: [
      { color: "#0000ff", point: 0 },
      { color: "#ff0000", point: 1 },
    ],
    plotdata: { x: [], y: [], z: [] },
    zoomIn: () => {},
    zoomOut: () => {},
  };

  changePlotParameter = (event) => {
    this.setState({ parameter: event.target.value });
  };

  setZoomIn = (newFunc) => {
    this.setState({ zoomIn: newFunc });
  };

  setZoomOut = (newFunc) => {
    this.setState({ zoomOut: newFunc });
  };

  closeSelect = () => {
    this.setState({
      plotdata: { x: [], y: [], z: [] },
    });
  };

  toggleHelp = () => {
    this.setState({
      help: !this.state.help,
      menu: false,
    });
  };

  toggleFullsize = () => {
    this.setState({
      fullsize: !this.state.fullsize,
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
    var { slice, graph, plotdata } = this.state;
    if (slice && graph === "slicegraph") {
      graph = "none";
    } else {
      graph = "slicegraph";
    }
    plotdata = { x: [], y: [], z: [] };
    this.setState({
      slice: !this.state.slice,
      timeline: false,
      menu: false,
      help: false,
      profile: false,
      point: false,
      graph,
      plotdata,
      line: !this.state.slice,
    });
  };

  removeNaN = (data) => {
    var keys = Object.keys(data);
    var var1 = [];
    var var2 = [];
    var var3 = [];
    for (var i = 0; i < data[keys[0]].length; i++) {
      if (
        !isNaN(parseInt(data[keys[0]][i])) &&
        !isNaN(parseInt(data[keys[1]][i])) &&
        !isNaN(parseInt(data[keys[2]][i]))
      ) {
        var1.push(data[keys[0]][i]);
        var2.push(data[keys[1]][i]);
        var3.push(data[keys[2]][i]);
      }
    }
    var out = { [keys[0]]: var1, [keys[1]]: var2, [keys[2]]: var3 };
    return out;
  };

  fillNaN2D = (data) => {
    for (var i = 0; i < data.y.length; i++) {
      if (data.z[i].every((e) => e === null)) {
        data.y[i] = null;
      }
    }
    return data;
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
          apiUrl + `/externaldata/meteolakes/depthprofile/zurich/${t}/${x}/${y}`
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
        .get(apiUrl + `/externaldata/meteolakes/timeline/zurich/12/${x}/${y}`)
        .then((response) => {
          var { x, y, z, z1 } = this.fillNaN2D(response.data);
          x = x.map((i) => new Date(i * 1000));
          var plotdata = { x, y, z, z1 };
          this.setState({ pointValue, plotdata });
        })
        .catch((error) => {
          this.setState({ pointValue, plotdata: { x: [], y: [], z: [] } });
        });
    }
  };

  updateLine = (lineValue) => {
    var { graph, time } = this.state;
    if (graph === "slicegraph" && lineValue.length > 0) {
      // Convert to meteolakes units
      var t = this.javascriptDatetimeToMatlab(time);
      var { x: x1, y: y1 } = this.WGSlatlngtoCH(
        lineValue[0].lat,
        lineValue[0].lng
      );
      var { x: x2, y: y2 } = this.WGSlatlngtoCH(
        lineValue[1].lat,
        lineValue[1].lng
      );
      axios
        .get(
          apiUrl +
            `/externaldata/meteolakes/transect/zurich/${t}/${x1}/${y1}/${x2}/${y2}`
        )
        .then((response) => {
          var { x, y, z, z1 } = this.fillNaN2D(response.data);
          var plotdata = { x, y, z, z1 };
          this.setState({ lineValue, plotdata });
        })
        .catch((error) => {
          this.setState({ lineValue, plotdata: { x: [], y: [], z: [] } });
        });
    } else {
      this.setState({ lineValue, plotdata: { x: [], y: [], z: [] } });
    }
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
      Math.abs(Math.sqrt(Math.pow(item[3], 2) + Math.pow(item[4], 2)))
    );
    min = Math.min(min, this.getMin(flat));
    max = Math.max(max, this.getMax(flat));
    return { min, max, array: flat };
  };

  toggleLayerView = (id) => {
    this.setState({ loading: true }, () => {
      var { selectedlayers } = this.state;
      var index = selectedlayers.findIndex((x) => x.id === id);
      selectedlayers[index].visible = !selectedlayers[index].visible;
      this.setState({ selectedlayers, loading: false });
    });
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

  updateBaseMap = (event) => {
    this.setState({ basemap: event.target.value });
  };

  updateMapLayers = (selectedlayers) => {
    this.setState({ loading: true }, () => {
      this.setState({ selectedlayers, loading: false });
    });
  };

  async componentDidMount() {
    var { files, dataset, parameters } = this.props;

    // Depth and Time
    var depths = [
      ...new Set(files.map((item) => parseFloat(item.mindepth))),
    ].sort(function (a, b) {
      return a - b;
    });
    var maxdepth = Math.max(...depths);
    var mindepth = Math.min(...depths);
    var times = [...new Set(files.map((item) => item.mindatetime))];

    times = times
      .map((t) => new Date(t))
      .sort(function (a, b) {
        return b - a;
      });
    var timesunix = times.map((t) => t.getTime());
    var mindatetime = Math.min(...timesunix);
    var maxdatetime = Math.max(...timesunix);
    var depth = depths[0];
    var time = times[times.length - 1];

    // Build Selected Layers object
    var selectedlayers = [];
    var plotparameters = parameters.filter(
      (p) => ![1, 2, 3, 4].includes(p.parameters_id)
    );
    plotparameters.sort((a, b) => (a.parameters_id > b.parameters_id ? -1 : 1));
    var layer;
    for (var i = 0; i < plotparameters.length; i++) {
      layer = {
        visible: true,
        dataset_index: 0,
      };
      layer = { ...layer, ...dataset.plotproperties };
      var colors = this.parseColor(layer["colors"]);
      layer["colors"] = colors;

      var fileIndex = files.findIndex(
        (f) =>
          f.mindepth === String(depth) && f.mindatetime === time.toISOString()
      );
      layer["fileid"] = files[fileIndex].id;
      var { data } = await axios
        .get(files[fileIndex].filelink)
        .catch((error) => {
          console.log(error);
        });

      var parameters_id = plotparameters[i].parameters_id;

      var min, max, array, mapplot, parameter_name;
      if (parameters_id === 25) {
        mapplot = "field";
        parameter_name = "Water Velocity";
        ({ min, max, array } = this.meteolakesVectorMinMax(data));
      } else {
        mapplot = "raster";
        parameter_name = "Water Temperature";
        ({ min, max, array } = this.meteolakesScalarMinMax(data));
      }
      layer["id"] = dataset.id + "?" + parameters_id;
      layer["datasets_id"] = dataset.id;
      layer["min"] = min;
      layer["max"] = max;
      layer["array"] = array;
      layer["legend"] = true;
      layer["mapplot"] = mapplot;
      layer["parameter_name"] = parameter_name;
      layer["datasetparameters"] = parameters;
      layer["parameters_id"] = parameters_id;
      layer["unit"] = plotparameters[i].unit;
      layer["title"] = dataset.title;
      layer["description"] = dataset.description;
      layer["files"] = files;
      layer["maxdepth"] = maxdepth;
      layer["mindepth"] = mindepth;
      layer["maxdatetime"] = maxdatetime;
      layer["mindatetime"] = mindatetime;
      selectedlayers.push(layer);
    }

    files[fileIndex]["data"] = data;
    dataset["files"] = files;
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
      colors,
      loading,
      graph,
      plotdata,
      parameter,
      basemap,
      depth,
      time,
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

    var graphclass = "graphwrapper hide";
    if (graph !== "none" && plotdata.x.length > 0) graphclass = "graphwrapper";

    if (selectedlayers.length > 0) {
      if (parameter === "Velocity") {
        colors = selectedlayers.find((sl) => sl.parameters_id === 25).colors;
      } else {
        colors = selectedlayers.find((sl) => sl.parameters_id === 5).colors;
      }
    }

    var punit = "°C";
    if (parameter === "Velocity") {
      punit = "m/s";
      if (graph === "depthgraph" && plotdata.x1) {
        plotdata = { x: plotdata.x1, y: plotdata.y };
      } else if (graph === "timegraph" && plotdata.z1) {
        plotdata = { x: plotdata.x, y: plotdata.y, z: plotdata.z1 };
      } else if (graph === "slicegraph" && plotdata.z1) {
        plotdata = { x: plotdata.x, y: plotdata.y, z: plotdata.z1 };
      }
    }

    return (
      <div className={fullsize ? "threed full" : "threed"}>
        <div className="basemapwrapper">
          <div className="controls">
            <MapControl
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              fullsize={fullsize}
              controls={controls}
              help={help}
              toggleHelp={this.toggleHelp}
              toggleFullsize={this.toggleFullsize}
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
            basemap={basemap}
            loading={loading}
          />

          <MapMenu
            menu={menu}
            help={help}
            toggleMenu={this.toggleMenu}
            toggleHelp={this.toggleHelp}
            menucontent={
              <ThreeDMenu
                basemap={basemap}
                updateBaseMap={this.updateBaseMap}
                selectedlayers={selectedlayers}
                toggleLayerView={this.toggleLayerView}
                updateMapLayers={this.updateMapLayers}
              />
            }
          />
          <div className="timeselector-gis">
            <DatetimeDepthSelector
              selectedlayers={selectedlayers}
              datasets={datasets}
              datetime={time}
              depth={depth}
              //onChangeDatetime={this.onChangeDatetime}
              //onChangeDepth={this.onChangeDepth}
            />
          </div>

          <Legend selectedlayers={selectedlayers} />

          {loading && (
            <div className="map-loader">
              <Loading />
              Downloading and plotting data
            </div>
          )}
        </div>

        {graph === "depthgraph" && plotdata.x.length > 0 && (
          <div className={graphclass}>
            <div className="close" onClick={this.closeSelect}>
              ×
            </div>
            <D3LineGraph
              data={plotdata}
              title={`${dataset.title} Depth Profile`}
              xlabel={parameter}
              ylabel={"Depth"}
              xunits={punit}
              yunits={"m"}
              lcolor={"#000000"}
              lweight={"1"}
              bcolor={"white"}
              xscale={"Linear"}
              yscale={"Linear"}
            />
          </div>
        )}
        {graph === "timegraph" && plotdata.x.length > 0 && (
          <div className={graphclass}>
            <div className="close" onClick={this.closeSelect}>
              ×
            </div>
            <D3HeatMap
              data={plotdata}
              title={`${dataset.title} Timeline`}
              xlabel={"Time"}
              ylabel={"Depth"}
              zlabel={parameter}
              xunits={""}
              yunits={"m"}
              zunits={punit}
              bcolor={"white"}
              colors={colors}
            />
          </div>
        )}
        {graph === "slicegraph" && plotdata.x.length > 0 && (
          <div className={graphclass}>
            <div className="close" onClick={this.closeSelect}>
              ×
            </div>
            <D3HeatMap
              data={plotdata}
              title={`${dataset.title} Transect`}
              xlinear={true}
              xlabel={"Distance"}
              ylabel={"Depth"}
              zlabel={parameter}
              xunits={"km"}
              yunits={"m"}
              zunits={punit}
              bcolor={"white"}
              colors={colors}
            />
          </div>
        )}
        {plotdata.x.length > 0 && (
          <select
            className="parameter-select"
            onChange={this.changePlotParameter}
            value={parameter}
          >
            <option value="Temperature">Water Temperature</option>
            <option value="Velocity">Water Velocity</option>
          </select>
        )}
      </div>
    );
  }
}

export default ThreeDModel;
