import React, { Component } from "react";
import GISMap from "../../graphs/leaflet/gis_map";
import axios from "axios";
import { apiUrl } from "../../config.json";
import FilterBox from "../../components/filterbox/filterbox";
import MapLayers from "../../components/maplayers/maplayers";
import AddLayers from "../../components/addlayers/addlayers";
import Legend from "../../components/legend/legend";
import colorlist from "../../components/colorramp/colors";
import DatetimeDepthSelector from "../../components/sliders/datetimedepthselector";
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
    datasetparameters: [],
    loading: true,
    selected: [],
    hidden: [],
    datetime: new Date(),
    depth: 0,
    center: [46.85, 7.55],
    zoom: 9,
    basemap: "datalakesmap",
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

  onChangeDatetime = async (event) => {
    var datetime;
    if (Array.isArray(event)) {
      datetime = new Date(event[0]);
    } else {
      datetime = event;
    }
    if (datetime.getTime() !== this.state.datetime.getTime()) {
      var { depth } = this.state;
      await this.updateVariable(datetime, depth);
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
      await this.updateVariable(datetime, depth);
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

  downloadFile = async (datafile, source) => {
    var data;
    if (source === "internal") {
      ({ data } = await axios.get(
        apiUrl + "/files/" + datafile.id + "?get=raw"
      ));
    } else {
      ({ data } = await axios
        .get(datafile.filelink, { timeout: 10000 })
        .catch((error) => {
          console.error(error);
          alert("Failed to add layer");
          this.setState({ loading: false });
        }));
    }
    return data;
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
      Math.abs(Math.sqrt(Math.pow(item[2], 2) + Math.pow(item[3], 2)))
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

  getMinMax = (files, parameters_id, datasetparameters, mapplotfunction) => {
    var min = Infinity;
    var max = -Infinity;
    var array = [];

    for (var i = 0; i < files.length; i++) {
      if (files[i].data) {
        var filemin, filemax;
        var filearray = [];
        var data = files[i].data;
        if (mapplotfunction === "gitPlot") {
          ({ filemin, filemax, filearray } = this.gitPlotMinMax(
            data,
            parameters_id,
            datasetparameters
          ));
        }
        if (mapplotfunction === "meteoSwissMarkers") {
          ({ filemin, filemax, filearray } = this.meteoSwissMarkersMinMax(
            data
          ));
        }
        if (mapplotfunction === "simstrat") {
          ({ filemin, filemax, filearray } = this.simstratMinMax(data));
        }
        if (mapplotfunction === "remoteSensing") {
          ({ filemin, filemax, filearray } = this.remoteSensingMinMax(data));
        }
        if (mapplotfunction === "meteolakesScalar") {
          ({ filemin, filemax, filearray } = this.meteolakesScalarMinMax(data));
        }
        if (mapplotfunction === "meteolakesVector") {
          ({ filemin, filemax, filearray } = this.meteolakesVectorMinMax(data));
        }
        if (mapplotfunction === "foenMarkers") {
          ({ filemin, filemax, filearray } = this.foenMarkersMinMax(data));
        }

        if (filemin < min) min = filemin;
        if (filemax > max) max = filemax;
        array = array.concat(filearray);
      }
    }
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
      var dataset_index = datasets.findIndex((x) => x.id === datasets_id);
      var parameter_index = parameters.findIndex((x) => x.id === parameters_id);
      if (dataset_index === -1 || parameter_index === -1) {
        alert("Failed to add layer, not found in database.");
        selected = selected.filter(
          (x) =>
            parseInt(x[0]) !== parseInt(datasets_id) ||
            parseInt(x[1]) !== parseInt(parameters_id)
        );
      } else {
        var parameter_name = parameters[parameter_index].name;
        var dataset = datasets[dataset_index];

        // Get file list for dataset
        if (dataset.files.length === 0) {
          var { data: files } = await axios.get(
            apiUrl + "/files?datasets_id=" + datasets_id + "&type=json"
          );
          dataset.files = files;
        }

        // Find closest file to datetime and depth
        var fileid = this.closestFile(datetime, depth, dataset.files);
        var datafile = dataset.files.find((f) => f.id === fileid);

        // Add data from file closes to datetime and depth
        if (!datafile.data) {
          datafile.data = await this.downloadFile(datafile, dataset.datasource);
        }

        // Get the dataset parameter
        var dp = datasetparameters.filter((d) => d.datasets_id === datasets_id);

        // Update the min and max value
        var { min, max, array } = this.getMinMax(
          dataset.files,
          parameters_id,
          dp,
          dataset.mapplotfunction
        );

        // Get unit
        var unit = dp.find((d) => d.parameters_id === parameters_id).unit;

        // Plot properties
        let layer = JSON.parse(JSON.stringify(dataset.plotproperties));

        layer["mindatetime"] = dataset.mindatetime;
        layer["maxdatetime"] = dataset.maxdatetime;
        layer["mindepth"] = dataset.mindepth;
        layer["maxdepth"] = dataset.maxdepth;

        layer["title"] = dataset.title;
        layer["mapplot"] = dataset.mapplot;
        layer["latitude"] = dataset.latitude;
        layer["longitude"] = dataset.longitude;
        layer["datasource"] = dataset.datasource;
        layer["description"] = dataset.description;
        layer["datasourcelink"] = dataset.datasourcelink;

        layer["min"] = min;
        layer["max"] = max;
        layer["unit"] = unit;
        layer["array"] = array;
        layer["fileid"] = fileid;
        layer["datasetparameters"] = dp;
        layer["datasets_id"] = datasets_id;
        layer["dataset_index"] = dataset_index;
        layer["parameters_id"] = parameters_id;
        layer["parameter_name"] = parameter_name;
        layer["parameter_index"] = parameter_index;
        layer.colors = this.parseColor(layer.colors);
        layer["id"] = datasets_id.toString() + "&" + parameters_id.toString();
        layer["visible"] = this.layervisible(
          datasets_id,
          parameters_id,
          hidden
        );

        selectedlayers.unshift(layer);
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
        var dataset = datasets[selectedlayers[i].dataset_index];

        // Find closest file to datetime and depth
        var fileid = this.closestFile(datetime, depth, dataset.files);
        var datafile = findFileId(dataset.files, fileid);

        // Add data from file closes to datetime and depth
        if (!datafile.data) {
          datafile.data = await this.downloadFile(datafile, dataset.datasource);
        }

        // Update the min and max value
        var { min, max, array } = this.getMinMax(
          dataset.files,
          selectedlayers[i].parameters_id,
          selectedlayers[i].datasetparameters,
          dataset.mapplotfunction
        );

        selectedlayers[i].min = min;
        selectedlayers[i].max = max;
        selectedlayers[i].array = array;
        selectedlayers[i].fileid = fileid;
      }

      this.setState({
        datetime,
        depth,
        selectedlayers,
        datasets,
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
        if (["datalakesmap", "swisstopo", "satellite"].includes(newValue)) {
          value = newValue;
        }
      }
    }
    return value;
  };

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
      if (search) {
        search = this.parseSearch(search);
        selected = this.updateSearch("selected", selected, search);
        hidden = this.updateSearch("hidden", hidden, search);
        datetime = this.updateSearch("datetime", datetime, search);
        depth = this.updateSearch("depth", depth, search);
        zoom = this.updateSearch("zoom", zoom, search);
        center = this.updateSearch("center", center, search);
        basemap = this.updateSearch("basemap", basemap, search);
      } else {
        this.props.history.push({
          pathname: pathname,
          search: defaultSearchLocation,
        });
      }
    } catch (e) {
      console.log(e);
      this.props.history.push({
        pathname: pathname,
        search: defaultSearchLocation,
      });
    }

    // Get parameters
    var { data: parameters } = await axios.get(
      apiUrl + "/selectiontables/parameters"
    );

    // Get datasets
    var { data: datasets } = await axios.get(apiUrl + "/datasets");
    datasets = datasets.map((d) => {
      d.files = [];
      return d;
    });

    // Get datasetparameters
    var { data: datasetparameters } = await axios.get(
      apiUrl + "/datasetparameters"
    );

    // Get templates
    var { data: meteoswiss } = await axios.get(
      apiUrl + "/externaldata/templates/meteoswiss"
    );
    var { data: foen } = await axios.get(
      apiUrl + "/externaldata/templates/foen"
    );
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
    } = this.state;
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
              selectedlayers={selectedlayers}
              datasets={datasets}
              datetime={datetime}
              depth={depth}
              onChangeDatetime={this.onChangeDatetime}
              onChangeDepth={this.onChangeDepth}
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
