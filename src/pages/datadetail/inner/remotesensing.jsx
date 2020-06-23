import React, { Component } from "react";
import axios from "axios";
import "../datadetail.css";
import Basemap from "../../../graphs/leaflet/basemap";
import "../rs.css";
import Loading from "../../../components/loading/loading";
import MapControl from "../../../components/mapcontrol/mapcontrol";
import sliceicon from "../img/sliceicon.svg";
import menuicon from "../img/menuicon.svg";
import colorlist from "../../../components/colorramp/colors";
import { apiUrl } from "../../../../src/config.json";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ColorManipulation from "../../../components/colormanipulation/colormanipulation";

class RemoteSensingSidebar extends Component {
  state = {};
  render() {
    var {
      basemap,
      updateBaseMap,
      datetime,
      onChangeDatetime,
      mindatetime,
      maxdatetime,
      pixelinfo,
      selectedlayers,
      onChangeColors,
    } = this.props;

    var colors = [];
    var array = [];
    if (selectedlayers.length > 0) {
      colors = selectedlayers[0].colors;
      array = selectedlayers[0].array;
    }
    var pixelrows = [];
    for (var i = 0; i < pixelinfo.length; i++) {
      pixelrows.push(
        <tr key={pixelinfo[i].name}>
          <td>{pixelinfo[i].name}</td>
          <td>{pixelinfo[i].value}</td>
          <td>{pixelinfo[i].unit}</td>
        </tr>
      );
    }

    return (
      <React.Fragment>
        <div className="layers">
          <div className="title">Select Products</div>
          <select
            className="basemapselector"
            onChange={updateBaseMap}
            value={basemap}
            title="Edit the background map style"
          >
            <option value="datalakesmap">Chlorophyll A</option>
            <option value="swisstopo">Turbidity</option>
          </select>

          <DatePicker
            selected={datetime}
            dateFormat="dd MMMM yyyy"
            onChange={onChangeDatetime}
            minDate={mindatetime}
            maxDate={maxdatetime}
          />
          <select
            className="basemapselector"
            onChange={updateBaseMap}
            value={basemap}
            title="Edit the background map style"
          >
            <option value="datalakesmap">Datalakes Map</option>
            <option value="swisstopo">Swisstopo</option>
            <option value="satellite">Satellite</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div className="pixelinfo">
          <div className="title">Pixel Information</div>
          <table>
            <tbody>{pixelrows}</tbody>
          </table>
        </div>
        <div className="colormanipulation">
          <div className="title">Color Manipulation</div>
          <ColorManipulation
            colors={colors}
            onChange={onChangeColors}
            array={array}
          />
        </div>
      </React.Fragment>
    );
  }
}

class RemoteSensing extends Component {
  state = {
    datetime: new Date(),
    depth: 0,
    selectedlayers: [],
    downloads: [],
    datasets: [],
    profile: false,
    timeline: false,
    slice: false,
    menu: true,
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
    pixelinfo: [
      { name: "Latitude", unit: "", value: "" },
      { name: "Longitude", unit: "", value: "" },
      { name: "Altitude", unit: "", value: "mAOD" },
    ],
    plotdata: { x: [], y: [], z: [] },
    zoomIn: () => {},
    zoomOut: () => {},
  };

  onChangeDatetime = async (event) => {
    var { depth, pointValue, lineValue } = this.state;
    var datetime;
    if (Array.isArray(event)) {
      datetime = new Date(event[0]);
    } else {
      datetime = event;
    }
    if (datetime.getTime() !== this.state.datetime.getTime()) {
      this.setState({ datetime }, async () => {
        this.updateVariable(datetime, depth);
        this.updatePoint(pointValue);
        this.updateLine(lineValue);
      });
    }
  };

  onChangeColors = (colors) => {
    this.setState({ loading: true }, async () => {
      var { selectedlayers } = this.state;
      selectedlayers[0].colors = colors;
      this.setState({
        selectedlayers,
        loading: false,
      });
    });
  };

  onChangeDepth = async (event) => {
    var { datetime, pointValue, lineValue } = this.state;
    var depth;
    if (Array.isArray(event)) {
      depth = parseFloat(event[0]);
    } else {
      depth = parseFloat(event.target.value);
    }
    if (depth !== this.state.depth) {
      this.setState({ depth }, async () => {
        this.updateVariable(datetime, depth);
        this.updatePoint(pointValue);
        this.updateLine(lineValue);
      });
    }
  };

  updateVariable = async (datetime, depth) => {
    function findFileId(files, fileid) {
      return files.find((f) => f.id === fileid);
    }
    this.setState({ loading: true }, async () => {
      var { selectedlayers, downloads } = this.state;

      for (var i = 0; i < selectedlayers.length; i++) {
        // Find closest file to datetime and depth
        var fileid = this.closestFile(datetime, depth, selectedlayers[i].files);
        var datafile = findFileId(selectedlayers[i].files, fileid);

        // Add data from file closes to datetime and depth
        var data, realdatetime, realdepth;
        ({ data, realdatetime, realdepth, downloads } = await this.downloadFile(
          selectedlayers[i].datasets_id,
          fileid,
          datafile.filelink,
          selectedlayers[i].datasource,
          datetime,
          depth,
          downloads
        ));

        var { min, max, array } = this.remoteSensingMinMax(data);

        // Update the min and max value
        selectedlayers[i].realdatetime = realdatetime;
        selectedlayers[i].realdepth = realdepth;
        selectedlayers[i].data = data;
        selectedlayers[i].min = min;
        selectedlayers[i].max = max;
        selectedlayers[i].array = array;
        selectedlayers[i].fileid = fileid;
      }

      this.setState({
        datetime,
        depth,
        selectedlayers,
        downloads,
        loading: false,
      });
    });
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
    console.log(date);
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
    var { graph, datetime } = this.state;
    if (graph === "depthgraph") {
      // Convert to meteolakes units
      var t = this.javascriptDatetimeToMatlab(datetime);
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
    var { graph, datetime } = this.state;
    if (graph === "slicegraph" && lineValue.length > 0) {
      // Convert to meteolakes units
      var t = this.javascriptDatetimeToMatlab(datetime);
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

  remoteSensingMinMax = (array) => {
    array = array.v;
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { min, max, array };
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

  closestFile = (datetime, depth, files) => {
    var time = new Date(datetime).getTime() / 1000;
    var array = [];
    for (var i = 0; i < files.length; i++) {
      var fileid = files[i].id;
      var mintime = new Date(files[i].mindatetime).getTime() / 1000;
      var maxtime = new Date(files[i].maxdatetime).getTime() / 1000;
      var mindepth = files[i].mindepth;
      var maxdepth = files[i].maxdepth;
      var timedistance;
      if (time > mintime && time < maxtime) {
        timedistance = 0;
      } else {
        timedistance = Math.min(
          Math.abs(mintime - time),
          Math.abs(maxtime - time)
        );
      }
      var depthdistance;
      if (depth > mindepth && depth < maxdepth) {
        depthdistance = 0;
      } else {
        depthdistance = Math.min(
          Math.abs(mindepth - depth),
          Math.abs(maxdepth - depth)
        );
      }
      array.push({ fileid, timedistance, depthdistance });
    }
    array.sort((a, b) => {
      if (a.timedistance > b.timedistance) {
        return 1;
      } else if (a.timedistance === b.timedistance) {
        if (a.depthdistance > b.depthdistance) {
          return 1;
        } else {
          return -1;
        }
      } else {
        return -1;
      }
    });
    return array[0].fileid;
  };

  getSliderParameters = (selectedlayers) => {
    var files = [];
    var mindatetime = Infinity;
    var maxdatetime = -Infinity;
    var mindepth = 0;
    var maxdepth = 1;
    for (var i = 0; i < selectedlayers.length; i++) {
      mindatetime = new Date(
        Math.min(mindatetime, new Date(selectedlayers[i].mindatetime))
      );
      maxdatetime = new Date(
        Math.max(maxdatetime, new Date(selectedlayers[i].maxdatetime))
      );
      maxdepth = Math.max(maxdepth, selectedlayers[i].maxdepth);

      files = files.concat(selectedlayers[i].files);
    }
    maxdepth = Math.min(370, maxdepth);
    if (mindatetime === Infinity)
      mindatetime = new Date().getTime() - 1209600000;
    if (maxdatetime === -Infinity) maxdatetime = new Date().getTime();
    maxdatetime = new Date(maxdatetime);
    mindatetime = new Date(mindatetime);
    return { files, mindepth, maxdepth, mindatetime, maxdatetime };
  };

  lastFile = (files) => {
    files.sort((a, b) =>
      new Date(a.maxdatetime).getTime() > new Date(b.maxdatetime).getTime()
        ? -1
        : 1
    );
    return files[0];
  };

  downloadFile = async (
    datasets_id,
    fileid,
    filelink,
    source,
    datetime,
    depth,
    downloads
  ) => {
    var downloaded = downloads.find(
      (d) =>
        d.datasets_id === datasets_id &&
        d.fileid === fileid &&
        d.datetime.getTime() === datetime.getTime() &&
        parseFloat(d.depth) === parseFloat(depth)
    );

    if (downloaded) {
      return {
        data: downloaded.data,
        realdatetime: downloaded.realdatetime,
        realdepth: downloaded.realdepth,
        downloads,
      };
    } else {
      var data, realdatetime, realdepth;
      var datetimeunix = Math.round(datetime.getTime() / 1000);
      filelink = filelink.replace(":datetime", datetimeunix);
      filelink = filelink.replace(":depth", depth);
      ({ data } = await axios
        .get(filelink, { timeout: 10000 })
        .catch((error) => {
          console.error(error);
          alert("Failed to add layer");
          this.setState({ loading: false });
        }));
      realdepth = depth;
      realdatetime = datetime;
      downloads.push({
        data,
        datetime,
        depth,
        datasets_id,
        fileid,
        realdatetime,
        realdepth,
      });
      return { data, realdatetime, realdepth, downloads };
    }
  };

  passLocation = (location) => {
    var { pixelinfo } = this.state;
    pixelinfo.find((pi) => pi.name === "Latitude").value = location.lat;
    pixelinfo.find((pi) => pi.name === "Longitude").value = location.lng;
    pixelinfo.find((pi) => pi.name === "Altitude").value = location.alt;
    this.setState(pixelinfo);
  };

  async componentDidMount() {
    var { files, dataset, datasetparameters } = this.props;
    var { downloads } = this.state;

    var maxdatetime = Math.max(
      ...files.map((f) => new Date(f.maxdatetime).getTime())
    );
    var mindatetime = Math.min(
      ...files.map((f) => new Date(f.mindatetime).getTime())
    );

    // Build Selected Layers object
    var selectedlayers = [];
    var plotparameters = datasetparameters.filter(
      (p) => ![1, 2, 3, 4].includes(p.parameters_id)
    );
    plotparameters.sort((a, b) => (a.parameters_id > b.parameters_id ? -1 : 1));
    for (var i = 0; i < plotparameters.length; i++) {
      var parameters_id = plotparameters[i].parameters_id;
      var datasets_id = dataset.id;

      // Find file with most recent data
      var file = this.lastFile(files);
      var datetime = new Date(file.maxdatetime);
      var depth = Math.round(file.mindepth * 10) / 10;

      // Download data
      var data, realdatetime, realdepth;
      ({ data, realdatetime, realdepth, downloads } = await this.downloadFile(
        datasets_id,
        file.id,
        file.filelink,
        dataset.datasource,
        datetime,
        depth,
        downloads
      ));

      // Get data min and max
      var { min, max, array } = this.remoteSensingMinMax(data);
      var unit = "Test";
      var name = "Name";

      let layer = {
        ...JSON.parse(JSON.stringify(dataset.plotproperties)),
        ...JSON.parse(JSON.stringify(dataset)),
      };

      // Add Additional Parameters
      layer["realdatetime"] = realdatetime;
      layer["realdepth"] = realdepth;
      layer["files"] = files;
      layer["name"] = name;
      layer["data"] = data;
      layer["min"] = min;
      layer["max"] = max;
      layer["unit"] = unit;
      layer["array"] = array;
      layer["fileid"] = file.id;
      layer["datasets_id"] = datasets_id;
      layer["datasetparameters"] = plotparameters;
      layer["parameters_id"] = parameters_id;
      layer["colors"] = this.parseColor(layer.colors);
      layer["id"] = datasets_id.toString() + "&" + parameters_id.toString();
      layer["visible"] = true;

      selectedlayers.push(layer);
    }

    var datasets = [dataset];
    this.setState({
      loading: false,
      depth,
      datetime,
      datasets,
      selectedlayers,
      downloads,
      maxdatetime,
      mindatetime,
    });
  }

  render() {
    var {
      selectedlayers,
      datasets,
      menu,
      slice,
      fullsize,
      help,
      point,
      line,
      maxdatetime,
      mindatetime,
      loading,
      basemap,
      datetime,
      pixelinfo,
      zoomIn,
      zoomOut,
    } = this.state;
    var controls = [
      { title: "Menu", active: menu, onClick: this.toggleMenu, img: menuicon },
      {
        title: "Transect",
        active: slice,
        onClick: this.toggleSlice,
        img: sliceicon,
      },
    ];

    return (
      <div className={fullsize ? "rs full" : "rs"}>
        <div className={menu ? "sidebar" : "sidebar hidden"}>
          <RemoteSensingSidebar
            basemap={basemap}
            updateBaseMap={this.updateBaseMap}
            datetime={datetime}
            onChangeDatetime={this.onChangeDatetime}
            mindatetime={mindatetime}
            maxdatetime={maxdatetime}
            pixelinfo={pixelinfo}
            selectedlayers={selectedlayers}
            onChangeColors={this.onChangeColors}
          />
        </div>
        <div className={menu ? "basemapwrapper" : "basemapwrapper full"}>
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
            passLocation={this.passLocation}
          />

          {loading && (
            <div className="map-loader">
              <Loading />
              Downloading and plotting data
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default RemoteSensing;
