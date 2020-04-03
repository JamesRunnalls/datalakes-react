import React, { Component } from "react";
import GISMap from "../../graphs/leaflet/gis_map";
import axios from "axios";
import { apiUrl } from "../../../src/config.json";
import FilterBox from "../../components/filterbox/filterbox";
import MapLayers from "../../components/maplayers/maplayers";
import AddLayers from "../../components/addlayers/addlayers";
import Legend from "../../components/legend/legend";
import colorlist from "../colorramp/colors";
import "./gis.css";
import TimeSelector from "../sliders/timeselector";

class SidebarGIS extends Component {
  render() {
    var {
      selectedlayers,
      datasets,
      parameters,
      selected,
      sidebarextratop,
      sidebarextrabottom,
      setSelected,
      removeSelected,
      toggleLayerView,
      updateMapLayers,
      addSelected
    } = this.props;
    return (
      <React.Fragment>
        {sidebarextratop}
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
          content={
            /*<AddLayers
              maplayers={maplayers}
              parameters={parameters}
              addSelected={addSelected}
            />*/ <div></div>
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
    selected: this.props.selected ? this.props.selected : [],
    hidden: this.props.hidden ? this.props.hidden : [],
    loading: true,
    datetime: new Date(1539860087772),
    depth: 18
  };

  setSelected = selectedlayers => {
    this.setState({ loading: true }, () => {
      //this.props.setQueryParams(selected, hidden);
      this.setState({ selectedlayers, loading: false });
    });
  };

  addSelected = async ids => {
    function maplayersfind(maplayers, id) {
      return maplayers.find(x => x.id === id);
    }
    this.setState({ loading: true }, async () => {
      var { selected, hidden, maplayers, parameters } = this.state;
      for (var i = 0; i < ids.length; i++) {
        if (!selected.includes(ids[i])) {
          if (!("data" in maplayersfind(maplayers, ids[i]))) {
            maplayers = await this.downloadFile(ids[i], maplayers);
            ({ maplayers, parameters } = this.updateMinMax(
              ids[i],
              maplayers,
              parameters
            ));
          }
          selected.unshift(ids[i]);
        }
      }
      this.props.setQueryParams(selected, hidden);
      this.setState({ selected, maplayers, parameters, loading: false });
    });
  };

  removeSelected = id => {
    this.setState({ loading: true }, () => {
      var { selectedlayers } = this.state;
      selectedlayers = selectedlayers.filter(x => x.id !== id);
      //this.props.setQueryParams(selected, hidden);
      this.setState({ selectedlayers, loading: false });
    });
  };

  toggleLayerView = id => {
    this.setState({ loading: true }, () => {
      var { selectedlayers } = this.state;
      var index = selectedlayers.findIndex(x => x.id === id);
      selectedlayers[index].visible = !selectedlayers[index].visible;
      //this.props.setQueryParams(selected, hidden);
      this.setState({ selectedlayers, loading: false });
    });
  };

  updateMapLayers = selectedlayers => {
    this.setState({ loading: true }, () => {
      this.setState({ selectedlayers, loading: false });
    });
  };

  downloadFile = async (fileid, files, dataset) => {
    var index = files.findIndex(x => x.id === fileid);
    if (dataset.datasource === "internal") {
      var { data } = await axios.get(
        apiUrl + "/files/" + files[index].id + "?get=raw"
      );
    } else {
      var { data } = await axios.get(files[index].filelink);
    }
    files[index].data = data;
    return files;
  };

  meteoSwissMarkersMinMax = layer => {
    var array = layer.features;
    array = array.map(x => x.properties.value);
    array = array.filter(x => x !== 9999);
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { filemin: min, filemax: max, filearray: array };
  };

  simstratMinMax = array => {
    array = array.map(x => x.value);
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { filemin: min, filemax: max, filearray: array };
  };

  remoteSensingMinMax = array => {
    array = array.v;
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { filemin: min, filemax: max, filearray: array };
  };

  meteolakesScalarMinMax = inarray => {
    var min = Infinity;
    var max = -Infinity;
    var flat;
    var array = [];
    for (var i = 0; i < inarray.length; i++) {
      flat = inarray[i].data.flat();
      flat = flat.filter(item => item !== null);
      flat = flat.map(item => item[2]);
      min = Math.min(min, this.getMin(flat));
      max = Math.max(max, this.getMax(flat));
      array = array.concat(flat);
    }
    return { filemin: min, filemax: max, filearray: array };
  };

  meteolakesVectorMinMax = inarray => {
    var min = Infinity;
    var max = -Infinity;
    var flat;
    var array = [];
    for (var i = 0; i < inarray.length; i++) {
      flat = inarray[i].data.flat();
      flat = flat.filter(item => item !== null);
      flat = flat.map(item =>
        Math.abs(Math.sqrt(Math.pow(item[2], 2) + Math.pow(item[3], 2)))
      );
      min = Math.min(min, this.getMin(flat));
      max = Math.max(max, this.getMax(flat));
      array = array.concat(flat);
    }
    return { filemin: min, filemax: max, filearray: array };
  };

  gitPlotMinMax = (data, parameters_id, datasetparameters) => {
    var datasetparameter = datasetparameters.find(
      dp => dp.parameters_id === parameters_id
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

        if (filemin < min) min = filemin;
        if (filemax > max) max = filemax;
        array = array.concat(filearray);
      }
    }
    return { min, max, array };
  };

  getMax = arr => {
    let len = arr.length;
    let max = -Infinity;

    while (len--) {
      max = arr[len] > max ? arr[len] : max;
    }
    return max;
  };

  getMin = arr => {
    let len = arr.length;
    let min = Infinity;

    while (len--) {
      min = arr[len] < min ? arr[len] : min;
    }
    return min;
  };

  parseColor = colorname => {
    var defaultColors = [
      { color: "#0000ff", point: 0 },
      { color: "#ff0000", point: 1 }
    ];
    var colorparse = colorlist.find(c => c.name === colorname);
    if (colorparse) {
      return colorparse.data;
    } else {
      return defaultColors;
    }
  };

  parseBoolean = bool => {
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
    console.log(array)
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
    console.log(array)
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

  async componentDidMount() {
    var { selected, hidden, datetime, depth } = this.state;
    //({ selected, hidden } = this.props.getQueryParams(selected, hidden));

    // Get parameters
    var { data: parameters } = await axios.get(
      apiUrl + "/selectiontables/parameters"
    );

    // Get datasets
    var { data: datasets } = await axios.get(apiUrl + "/datasets");

    // Build selected layers object
    var selectedlayers = [];
    for (var i = 0; i < selected.length; i++) {
      var datasets_id = selected[i][0];
      var parameters_id = selected[i][1];

      // Find index of datasets and parameters
      var dataset_index = datasets.findIndex(x => x.id === datasets_id);
      var parameter_index = parameters.findIndex(x => x.id === parameters_id);
      var dataset = datasets[dataset_index];

      // Get file list for dataset
      var { data: files } = await axios.get(
        apiUrl + "/files?datasets_id=" + datasets_id
      );

      // Find closest file to datetime and depth
      var fileid = this.closestFile(datetime, depth, files);

      // Add data from file closes to datetime and depth
      files = await this.downloadFile(fileid, files, dataset);
      dataset.files = files;

      // Get the dataset parameter
      var { data: datasetparameters } = await axios.get(
        apiUrl + "/datasetparameters?datasets_id=" + datasets_id
      );

      // Update the min and max value
      var { min, max, array } = this.getMinMax(
        files,
        parameters_id,
        datasetparameters,
        dataset.mapplotfunction
      );

      // Plot properties
      var layer = dataset.plotproperties;

      layer["title"] = dataset.title;
      layer["mapplot"] = dataset.mapplot;
      layer["latitude"] = dataset.latitude;
      layer["longitude"] = dataset.longitude;
      layer["datasource"] = dataset.datasource;
      layer["description"] = dataset.description;
      layer["datasourcelink"] = dataset.datasourcelink;

      layer["min"] = min;
      layer["max"] = max;
      layer["array"] = array;
      layer["fileid"] = fileid;
      layer["datasets_id"] = datasets_id;
      layer["parameters_id"] = parameters_id;
      layer["dataset_index"] = dataset_index;
      layer["parameter_index"] = parameter_index;
      layer["datasetparameters"] = datasetparameters;
      layer.colors = this.parseColor(layer.colors);
      layer["id"] = datasets_id.toString() + "&" + parameters_id.toString();
      layer["visible"] = this.layervisible(datasets_id, parameters_id, hidden);
      selectedlayers.push(layer);
    }

    this.setState({
      selectedlayers,
      selected,
      hidden,
      parameters,
      datasets,
      loading: false
    });
  }

  render() {
    var { selectedlayers, datasets, parameters, loading, datetime, depth } = this.state;
    var {
      documentTitle,
      title,
      sidebarextratop,
      sidebarextrabottom
    } = this.props;
    document.title = documentTitle;
    return (
      <React.Fragment>
        <h1>{title}</h1>
        <GISMap
          datetime={datetime}
          depth={depth}
          selectedlayers={selectedlayers}
          datasets={datasets}
          legend={/*<Legend selectedlayers />*/ <div></div>}
          timeselector={<TimeSelector selectedlayers />}
          loading={loading}
          sidebar={
            <SidebarGIS
              selectedlayers={selectedlayers}
              datasets={datasets}
              parameters={parameters}
              sidebarextratop={sidebarextratop}
              sidebarextrabottom={sidebarextrabottom}
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
