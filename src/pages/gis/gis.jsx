import React, { Component } from "react";
import GISMap from "../../graphs/leaflet/gis_map";
import axios from "axios";
import { apiUrl } from "../../config.json";
import FilterBox from "../../components/filterbox/filterbox";
import MapLayers from "../../components/maplayers/maplayers";
import AddLayers from "../../components/addlayers/addlayers";
import Legend from "../../components/legend/legend";
import colorlist from "../../components/colorramp/colors";
import DatetimeDepthSelector from "../../components/datetimedepthselector/datetimedepthselector";
import "./gis.css";

class SidebarGIS extends Component {
  render() {
    var {
      selectedlayers,
      datasets,
      parameters,
      datasetparameters,
      sidebarextratop,
      sidebarextrabottom,
      setSelected,
      removeSelected,
      toggleLayerView,
      updateMapLayers,
      addSelected,
      basemap,
      updateBaseMap,
    } = this.props;
    var add;
    if (selectedlayers.length === 0) add = "true";
    return (
      <React.Fragment>
        {sidebarextratop}
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
                <option value="dark">Dark</option>
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
              setSelected={setSelected}
              removeSelected={removeSelected}
              toggleLayerView={toggleLayerView}
              updateMapLayers={updateMapLayers}
            />
          }
        />
        <FilterBox
          title="Add Layers"
          preopen={add}
          content={
            <AddLayers
              datasets={datasets}
              parameters={parameters}
              datasetparameters={datasetparameters}
              addSelected={addSelected}
            />
          }
        />
        {sidebarextrabottom}
      </React.Fragment>
    );
  }
}

class GIS extends Component {
  state = {
    selectedlayers: [],
    parameters: [],
    datasets: [],
    downloads: [],
    datasetparameters: [],
    loading: true,
    selected: [],
    hidden: [],
    datetime: new Date(),
    depth: 0,
    timestep: 120,
    center: [46.85, 7.55],
    zoom: 9,
    basemap: "datalakesmap",
    play: false,
  };

  togglePlay = () => {
    this.setState({ play: !this.state.play });
  };

  updateLocation = (zoom, center) => {
    if (zoom !== this.state.zoom || center !== this.state.center) {
      this.setState({ zoom, center });
    }
  };

  updateState = async (newState) => {
    this.setState({ loading: true }, async () => {
      if ("selected" in newState) {
        var {
          datasets,
          datasetparameters,
          parameters,
          datetime,
          depth,
          hidden,
        } = this.state;
        var { selected } = newState;
        var selectedlayers = [];
        var fixedSelected = JSON.parse(JSON.stringify(selected));
        for (var i = 0; i < fixedSelected.length; i++) {
          var datasets_id = fixedSelected[i][0];
          var parameters_id = fixedSelected[i][1];
          ({ selectedlayers, datasets, selected } = await this.addNewLayer(
            selected,
            datasets_id,
            parameters_id,
            datasets,
            selectedlayers,
            datasetparameters,
            parameters,
            datetime,
            depth,
            hidden
          ));
        }
        newState["selectedlayers"] = selectedlayers;
        newState["datasets"] = datasets;
      }
      newState["loading"] = false;
      this.setState(newState);
    });
  };

  onChangeTimestep = (timestep) => {
    if (timestep !== this.state.timestep) {
      this.setState({ timestep });
    }
  };

  onChangeDatetime = async (datetime) => {
    if (datetime.getTime() !== this.state.datetime.getTime()) {
      var { depth } = this.state;
      this.setState({ datetime }, async () => {
        this.updateVariable(datetime, depth);
      });
    }
  };

  onChangeDepth = async (event) => {
    var depth;
    if (Array.isArray(event)) {
      depth = parseFloat(event[0]);
    } else {
      depth = parseFloat(event.target.value);
    }
    if (depth !== this.state.depth) {
      var { datetime } = this.state;
      this.setState({ depth }, async () => {
        this.updateVariable(datetime, depth);
      });
    }
  };

  setSelected = (selectedlayers) => {
    this.setState({ loading: true }, () => {
      var selected = [];
      for (var i = 0; i < selectedlayers.length; i++) {
        selected.push([
          selectedlayers[i].datasets_id,
          selectedlayers[i].parameters_id,
        ]);
      }
      this.setState({ selectedlayers, selected, loading: false });
    });
  };

  addSelected = async (ids) => {
    this.setState({ loading: true }, async () => {
      var {
        datasets,
        selected,
        selectedlayers,
        datasetparameters,
        parameters,
        datetime,
        depth,
        hidden,
      } = this.state;
      for (var i = 0; i < ids.length; i++) {
        var { datasets_id, parameters_id } = ids[i];
        selected.unshift([datasets_id, parameters_id]);
        ({ selectedlayers, datasets, selected } = await this.addNewLayer(
          selected,
          datasets_id,
          parameters_id,
          datasets,
          selectedlayers,
          datasetparameters,
          parameters,
          datetime,
          depth,
          hidden
        ));
      }
      this.setState({ selectedlayers, selected, datasets, loading: false });
    });
  };

  removeSelected = (id) => {
    var dp = id.split("&");
    this.setState({ loading: true }, () => {
      var { selectedlayers, selected, hidden } = this.state;
      selectedlayers = selectedlayers.filter((x) => x.id !== id);
      selected = selected.filter(
        (x) =>
          parseInt(x[0]) !== parseInt(dp[0]) ||
          parseInt(x[1]) !== parseInt(dp[1])
      );
      hidden = hidden.filter(
        (x) =>
          parseInt(x[0]) !== parseInt(dp[0]) ||
          parseInt(x[1]) !== parseInt(dp[1])
      );
      this.setState({ selectedlayers, selected, hidden, loading: false });
    });
  };

  toggleLayerView = (id) => {
    this.setState({ loading: true }, () => {
      var { selectedlayers, hidden } = this.state;
      var index = selectedlayers.findIndex((x) => x.id === id);
      selectedlayers[index].visible = !selectedlayers[index].visible;
      var idArr = id.split("&");
      var idParse = [parseInt(idArr[0]), parseInt(idArr[1])];
      var h_fil = hidden.filter(
        (h) => h[0] !== idParse[0] && h[1] !== idParse[1]
      );
      if (h_fil.length !== hidden.length) {
        hidden = h_fil;
      } else {
        hidden.push(idParse);
      }
      this.setState({ selectedlayers, hidden, loading: false });
    });
  };

  updateMapLayers = (selectedlayers) => {
    this.setState({ loading: true }, () => {
      this.setState({ selectedlayers, loading: false });
    });
  };

  updateBaseMap = (event) => {
    this.setState({ basemap: event.target.value });
  };

  meteoSwissMarkersMinMax = (layer) => {
    var array = layer.map((x) => x.v);
    array = array.filter((x) => x !== 9999);
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { filemin: min, filemax: max, filearray: array };
  };

  foenMarkersMinMax = (layer) => {
    var array = layer.map((x) => x.v);
    array = array.filter((x) => x !== 9999);
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { filemin: min, filemax: max, filearray: array };
  };

  simstratMinMax = (array) => {
    array = array.map((x) => x.value);
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { filemin: min, filemax: max, filearray: array };
  };

  remoteSensingMinMax = (array) => {
    array = array.v;
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { filemin: min, filemax: max, filearray: array };
  };

  meteolakesScalarMinMax = (inarray) => {
    var min = Infinity;
    var max = -Infinity;
    var flat = inarray.flat();
    flat = flat.filter((item) => item !== null);
    flat = flat.map((item) => item[2]);
    min = Math.min(min, this.getMin(flat));
    max = Math.max(max, this.getMax(flat));
    return { filemin: min, filemax: max, filearray: flat };
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
    return { filemin: min, filemax: max, filearray: flat };
  };

  gitPlotMinMax = (data, parameters_id, datasetparameters) => {
    var datasetparameter = datasetparameters.find(
      (dp) => dp.parameters_id === parameters_id
    );
    var array = data[datasetparameter.axis].flat();
    var min = this.getMin(array);
    var max = this.getMax(array);
    return { filemin: min, filemax: max, filearray: array };
  };

  getMinMax = (data, parameters_id, datasetparameters, mapplotfunction) => {
    var min = Infinity;
    var max = -Infinity;
    var array = [];

    var filemin, filemax;
    var filearray = [];

    if (mapplotfunction === "gitPlot") {
      ({ filemin, filemax, filearray } = this.gitPlotMinMax(
        data,
        parameters_id,
        datasetparameters
      ));
    }
    if (mapplotfunction === "meteoSwissMarkers") {
      ({ filemin, filemax, filearray } = this.meteoSwissMarkersMinMax(data));
    }
    if (mapplotfunction === "simstrat") {
      ({ filemin, filemax, filearray } = this.simstratMinMax(data));
    }
    if (mapplotfunction === "remoteSensing") {
      ({ filemin, filemax, filearray } = this.remoteSensingMinMax(data));
    }
    if (mapplotfunction === "meteolakes") {
      if (parameters_id === 25) {
        ({ filemin, filemax, filearray } = this.meteolakesVectorMinMax(
          data.data
        ));
      } else {
        ({ filemin, filemax, filearray } = this.meteolakesScalarMinMax(
          data.data
        ));
      }
    }

    if (mapplotfunction === "foenMarkers") {
      ({ filemin, filemax, filearray } = this.foenMarkersMinMax(data));
    }

    if (filemin < min) min = filemin;
    if (filemax > max) max = filemax;
    array = array.concat(filearray);

    return { min, max, array };
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

  layervisible = (datasets_id, parameters_id, hidden) => {
    var visible = true;
    for (var i = 0; i < hidden.length; i++) {
      if (datasets_id === hidden[i][0] && parameters_id === hidden[i][1]) {
        visible = false;
      }
    }
    return visible;
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

  downloadFile = async (
    datasets_id,
    fileid,
    filelink,
    source,
    datetime,
    depth
  ) => {
    var { downloads } = this.state;
    var downloaded = downloads.find(
      (d) =>
        d.datasets_id === datasets_id &&
        d.fileid === fileid &&
        d.datetime === datetime &&
        d.depth === depth
    );

    if (downloaded) {
      return {
        data: downloaded.data,
        realdatetime: datetime,
        realdepth: depth,
      };
    } else {
      var data, realdatetime, realdepth, realdata;
      if (source === "internal") {
        ({ data } = await axios.get(apiUrl + "/files/" + fileid + "?get=raw"));
        realdatetime = datetime;
        realdepth = depth;
      } else if (filelink.includes("?closest")) {
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
        if ("datetime" in data) {
          ({ datetime: realdatetime, depth: realdepth, data: realdata } = data);
          data = realdata;
        } else {
          realdatetime = datetime;
          realdepth = depth;
        }
      } else {
        filelink = filelink.replace(":datetime", datetime.getTime());
        filelink = filelink.replace(":depth", depth);
        ({ data } = await axios
          .get(filelink, { timeout: 10000 })
          .catch((error) => {
            console.error(error);
            alert("Failed to add layer");
            this.setState({ loading: false });
          }));
        realdatetime = datetime;
        realdepth = depth;
      }
      downloads.push({
        data,
        datetime,
        depth,
        datasets_id,
        fileid,
        realdatetime,
        realdepth,
      });
      this.setState({ downloads });
      return { data, realdatetime: new Date(realdatetime * 1000), realdepth };
    }
  };

  optimisePoints = (array, colors) => {
    var min = Math.min(...array);
    var max = Math.max(...array);
    var q, val, point;
    for (var i = 0; i < colors.length; i++) {
      if (i === 0) colors[i].point = 0;
      else if (i === colors.length - 1) colors[i].point = 1;
      else {
        q = (1 / (colors.length - 1)) * i;
        val = this.quantile(array, q);
        point = (val - min) / (max - min);
        colors[i].point = point;
      }
    }
    return colors;
  };

  quantile = (arr, q) => {
    const sorted = arr.slice(0).sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  };

  addNewLayer = async (
    selected,
    datasets_id,
    parameters_id,
    datasets,
    selectedlayers,
    datasetparameters,
    parameters,
    datetime,
    depth,
    hidden
  ) => {
    // Check layer not already loaded
    if (
      selectedlayers.filter(
        (sl) =>
          sl.datasets_id === datasets_id && sl.parameters_id === parameters_id
      ).length === 0
    ) {
      // Find index of datasets and parameters
      var dataset = datasets.find((d) => d.id === datasets_id);
      var parameter = parameters.find((p) => p.id === parameters_id);

      if (dataset && parameter) {
        // Get file list for dataset
        var { data: files } = await axios.get(
          apiUrl + "/files?datasets_id=" + datasets_id + "&type=json"
        );

        // Find closest file to datetime and depth
        var fileid = this.closestFile(datetime, depth, files);
        var datafile = files.find((f) => f.id === fileid);

        var { data, realdatetime, realdepth } = await this.downloadFile(
          datasets_id,
          fileid,
          datafile.filelink,
          dataset.datasource,
          datetime,
          depth
        );

        // Get the dataset parameter
        var dp = datasetparameters.filter((d) => d.datasets_id === datasets_id);

        // Update the parameter min and max value
        var { min, max, array } = this.getMinMax(
          data,
          parameters_id,
          dp,
          dataset.mapplotfunction
        );

        // Get unit
        var unit = dp.find((d) => d.parameters_id === parameters_id).unit;

        // Merge Plot properties, dataset and parameter
        let layer = {
          ...JSON.parse(JSON.stringify(dataset.plotproperties)),
          ...JSON.parse(JSON.stringify(parameter)),
          ...JSON.parse(JSON.stringify(dataset)),
        };

        // Meteolakes hack
        if (parameters_id === 25) {
          layer["mapplot"] = "field";
        }

        // Moving Average for Remote Sensing
        if (dataset.mapplotfunction === "remoteSensing") {
          layer["movingAverage"] = 4;
        }

        // Optimise colors
        var unoptimisedcolors = this.parseColor(layer.colors);
        var optimisedcolors = this.optimisePoints(array, unoptimisedcolors);

        // Add Additional Parameters
        layer["files"] = files;
        layer["data"] = data;
        layer["min"] = min;
        layer["max"] = max;
        layer["unit"] = unit;
        layer["array"] = array;
        layer["fileid"] = fileid;
        layer["datasetparameters"] = dp;
        layer["datasets_id"] = datasets_id;
        layer["parameters_id"] = parameters_id;
        layer["realdatetime"] = realdatetime;
        layer["realdepth"] = realdepth;
        layer["colors"] = optimisedcolors;
        layer["id"] = datasets_id.toString() + "&" + parameters_id.toString();
        layer["visible"] = this.layervisible(
          datasets_id,
          parameters_id,
          hidden
        );

        selectedlayers.unshift(layer);
      } else {
        alert("Failed to add layer, not found in database.");
        selected = selected.filter(
          (x) =>
            parseInt(x[0]) !== parseInt(datasets_id) ||
            parseInt(x[1]) !== parseInt(parameters_id)
        );
      }
    }
    return { selectedlayers, datasets, selected };
  };

  updateVariable = async (datetime, depth) => {
    function findFileId(files, fileid) {
      return files.find((f) => f.id === fileid);
    }
    this.setState({ loading: true }, async () => {
      var { selectedlayers, datasets } = this.state;

      for (var i = 0; i < selectedlayers.length; i++) {
        // Find closest file to datetime and depth
        var fileid = this.closestFile(datetime, depth, selectedlayers[i].files);
        var datafile = findFileId(selectedlayers[i].files, fileid);

        // Add data from file closes to datetime and depth
        var { data, realdatetime, realdepth } = await this.downloadFile(
          selectedlayers[i].datasets_id,
          fileid,
          datafile.filelink,
          selectedlayers[i].datasource,
          datetime,
          depth
        );

        // Update the min and max value
        var { min, max, array } = this.getMinMax(
          data,
          selectedlayers[i].parameters_id,
          selectedlayers[i].datasetparameters,
          selectedlayers[i].mapplotfunction
        );
        selectedlayers[i].data = data;
        selectedlayers[i].min = min;
        selectedlayers[i].max = max;
        selectedlayers[i].array = array;
        selectedlayers[i].fileid = fileid;
        selectedlayers[i]["realdatetime"] = realdatetime;
        selectedlayers[i]["realdepth"] = realdepth;
      }

      this.setState({
        datetime,
        depth,
        datasets,
        selectedlayers,
        loading: false,
      });
    });
  };

  searchLocation = (
    selected,
    hidden,
    datetime,
    depth,
    zoom,
    center,
    basemap
  ) => {
    return [
      "?",
      "selected=",
      JSON.stringify(selected),
      "&hidden=",
      JSON.stringify(hidden),
      "&datetime=",
      datetime.getTime() / 1000,
      "&depth=",
      depth,
      "&zoom=",
      JSON.stringify(zoom),
      "&center=",
      JSON.stringify(center),
      "&basemap=",
      basemap,
    ].join("");
  };

  parseSearch = (search) => {
    search = search.replace("?", "").split("&");
    var out = {};
    for (var i = 0; i < search.length; i++) {
      try {
        var split = search[i].split("=");
        if (["selected", "hidden", "center"].includes(split[0])) {
          out[split[0]] = JSON.parse(split[1]);
        } else if (split[0] === "datetime") {
          out[split[0]] = new Date(split[1] * 1000);
        } else if (["depth", "zoom"].includes(split[0])) {
          out[split[0]] = parseFloat(split[1]);
        } else if (split[0] === "basemap") {
          out[split[0]] = split[1];
        }
      } catch (e) {
        console.error("Parsing query " + split[0] + " failed.");
      }
    }
    return out;
  };

  updateSearch = (query, value, search) => {
    if (query in search) {
      var newValue = search[query];
      if (["selected", "hidden"].includes(query)) {
        if (Array.isArray(newValue)) {
          value = newValue;
        }
      } else if (["depth"].includes(query)) {
        let depth = newValue;
        if (depth > -2 && depth < 400) {
          value = depth;
        }
      } else if (["datetime"].includes(query)) {
        let dt = newValue.getTime() / 1000;
        let dt_max = new Date().getTime() / 1000 + 30 * 24 * 60 * 60;
        if (dt > 0 && dt < dt_max) {
          value = newValue;
        }
      } else if (["zoom"].includes(query)) {
        let zoom = parseInt(newValue);
        if (zoom > 0 && zoom < 18) {
          value = zoom;
        }
      } else if (["center"].includes(query)) {
        let lat = parseFloat(newValue[0]);
        let lng = parseFloat(newValue[1]);
        if (lat > -85 && lat < 85 && lng > -180 && lng < 180) {
          value = [lat, lng];
        }
      } else if (["basemap"].includes(query)) {
        if (
          ["datalakesmap", "swisstopo", "satellite", "dark"].includes(newValue)
        ) {
          value = newValue;
        }
      }
    }
    return value;
  };

  fixedEncodeURI = (str) => {
    return str.replace(/%5b/g, "[").replace(/%5d/g, "]");
  };

  componentDidUpdate(prevState) {
    var {
      selected,
      hidden,
      datetime,
      depth,
      zoom,
      center,
      basemap,
    } = this.state;
    var newSearch = this.searchLocation(
      selected,
      hidden,
      datetime,
      depth,
      zoom,
      center,
      basemap
    );
    let { search, pathname } = this.props.location;
    if (newSearch !== search) {
      this.props.history.push({
        pathname: pathname,
        search: newSearch,
      });
    }
  }

  async componentDidMount() {
    // Defaults
    var {
      selected,
      hidden,
      datetime,
      depth,
      zoom,
      center,
      basemap,
    } = this.state;

    var defaultSearchLocation = this.searchLocation(
      selected,
      hidden,
      datetime,
      depth,
      zoom,
      center,
      basemap
    );

    // Parse location search
    const pathname = this.props.location.pathname;
    try {
      var { search } = this.props.location;
      search = this.fixedEncodeURI(search);
      if (search) {
        search = this.parseSearch(search);
        selected = this.updateSearch("selected", selected, search);
        hidden = this.updateSearch("hidden", hidden, search);
        datetime = this.updateSearch("datetime", datetime, search);
        depth = this.updateSearch("depth", depth, search);
        zoom = this.updateSearch("zoom", zoom, search);
        center = this.updateSearch("center", center, search);
        basemap = this.updateSearch("basemap", basemap, search);
        this.props.history.push({
          pathname: pathname,
          search: search,
        });
      } else {
        this.props.history.push({
          pathname: pathname,
          search: defaultSearchLocation,
        });
      }
    } catch (e) {
      console.error("Error processing search parameters.");
      this.props.history.push({
        pathname: pathname,
        search: defaultSearchLocation,
      });
    }

    // Get data
    let server = await Promise.all([
      axios.get(apiUrl + "/selectiontables/parameters"),
      axios.get(apiUrl + "/datasets"),
      axios.get(apiUrl + "/datasetparameters"),
      axios.get(apiUrl + "/externaldata/templates/meteoswiss"),
      axios.get(apiUrl + "/externaldata/templates/foen"),
    ]).catch((error) => {
      this.setState({ step: "error" });
    });

    var parameters = server[0].data;
    var datasets = server[1].data;
    var datasetparameters = server[2].data;
    var meteoswiss = server[3].data;
    var foen = server[4].data;
    var templates = { meteoswiss, foen };

    // Build selected layers object
    var selectedlayers = [];
    var fixedSelected = JSON.parse(JSON.stringify(selected));
    for (var i = fixedSelected.length - 1; i > -1; i--) {
      var datasets_id = fixedSelected[i][0];
      var parameters_id = fixedSelected[i][1];
      ({ selectedlayers, datasets, selected } = await this.addNewLayer(
        selected,
        datasets_id,
        parameters_id,
        datasets,
        selectedlayers,
        datasetparameters,
        parameters,
        datetime,
        depth,
        hidden
      ));
    }

    this.setState({
      selectedlayers,
      parameters,
      datasets,
      datasetparameters,
      loading: false,
      templates,
      selected,
      hidden,
      datetime,
      depth,
      zoom,
      center,
      basemap,
    });
  }

  render() {
    var {
      selectedlayers,
      datasets,
      parameters,
      datasetparameters,
      loading,
      datetime,
      depth,
      templates,
      basemap,
      zoom,
      center,
      play,
      timestep,
    } = this.state;
    var {
      files,
      mindatetime,
      maxdatetime,
      mindepth,
      maxdepth,
    } = this.getSliderParameters(selectedlayers);
    document.title = "Map Viewer - Datalakes";
    return (
      <React.Fragment>
        <h1>Map Viewer</h1>
        <GISMap
          datetime={datetime}
          depth={depth}
          zoom={zoom}
          center={center}
          selectedlayers={selectedlayers}
          datasets={datasets}
          legend={<Legend selectedlayers={selectedlayers} />}
          templates={templates}
          basemap={basemap}
          updateLocation={this.updateLocation}
          updateState={this.updateState}
          timeselector={
            <DatetimeDepthSelector
              files={files}
              mindatetime={mindatetime}
              maxdatetime={maxdatetime}
              mindepth={mindepth}
              maxdepth={maxdepth}
              datetime={datetime}
              depth={depth}
              play={play}
              timestep={timestep}
              togglePlay={this.togglePlay}
              onChangeDatetime={this.onChangeDatetime}
              onChangeDepth={this.onChangeDepth}
              onChangeTimestep={this.onChangeTimestep}
            />
          }
          loading={loading}
          sidebar={
            <SidebarGIS
              selectedlayers={selectedlayers}
              datasets={datasets}
              parameters={parameters}
              datasetparameters={datasetparameters}
              basemap={basemap}
              updateBaseMap={this.updateBaseMap}
              setSelected={this.setSelected}
              removeSelected={this.removeSelected}
              toggleLayerView={this.toggleLayerView}
              updateMapLayers={this.updateMapLayers}
              addSelected={this.addSelected}
            />
          }
        />
      </React.Fragment>
    );
  }
}

export default GIS;
