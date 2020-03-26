import React, { Component } from "react";
import GISMap from "../../graphs/leaflet/gis_map";
import axios from "axios";
import { apiUrl } from "../../../config.json";
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
      maplayers,
      parameters,
      selected,
      hidden,
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
              maplayers={maplayers}
              selected={selected}
              hidden={hidden}
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
            <AddLayers
              maplayers={maplayers}
              parameters={parameters}
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
    parameters: [],
    maplayers: [],
    selected: this.props.selected ? this.props.selected : [],
    hidden: this.props.hidden ? this.props.hidden : [],
    loading: true
  };

  setSelected = selected => {
    this.setState({ loading: true }, () => {
      this.setState({ selected, loading: false });
    });
  };

  addSelected = async ids => {
    function maplayersfind(maplayers, id) {
      return maplayers.find(x => x.id === id);
    }
    this.setState({ loading: true }, async () => {
      var { selected, maplayers, parameters } = this.state;
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
      this.setState({ selected, maplayers, parameters, loading: false });
    });
  };

  removeSelected = ids => {
    function selectedfilter(selected, id) {
      return selected.filter(selectid => selectid !== id);
    }
    this.setState({ loading: true }, () => {
      var { selected, hidden } = this.state;
      for (var i = 0; i < ids.length; i++) {
        selected = selectedfilter(selected, ids[i]);
        hidden = selectedfilter(hidden, ids[i]);
      }
      this.setState({ selected, hidden, loading: false });
    });
  };

  toggleLayerView = id => {
    this.setState({ loading: true }, () => {
      var { hidden } = this.state;
      if (hidden.includes(id)) {
        hidden = hidden.filter(selectid => selectid !== id);
      } else {
        hidden.push(id);
      }
      this.setState({ hidden, loading: false });
    });
  };

  updateMapLayers = maplayers => {
    this.setState({ loading: true }, () => {
      this.setState({ maplayers, loading: false });
    });
  };

  downloadFile = async (id, maplayers) => {
    var index = maplayers.findIndex(x => x.id === id);
    var { data } = await axios.get(maplayers[index].api);
    maplayers[index].data = data;
    return maplayers;
  };

  meteoSwissMarkersMinMax = layer => {
    var array = layer.data.features;
    array = array.map(x => x.properties.value);
    array = array.filter(x => x !== 9999);
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { min: min, max: max, array: array };
  };

  simstratMinMax = layer => {
    var array = layer.data;
    array = array.map(x => x.value);
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { min: min, max: max, array: array };
  };

  remoteSensingMinMax = layer => {
    var array = layer.data;
    array = array.v;
    var max = this.getMax(array);
    var min = this.getMin(array);
    return { min: min, max: max, array: array };
  };

  meteolakesScalarMinMax = layer => {
    var inarray = layer.data;
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
    return { min: min, max: max, array: array };
  };

  meteolakesVectorMinMax = layer => {
    var inarray = layer.data;
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
    return { min: min, max: max, array: array };
  };

  updateMinMax = (id, maplayers, parameters) => {
    var index = maplayers.findIndex(x => x.id === id);
    var layer = JSON.parse(JSON.stringify(maplayers[index]));
    var parameterIndex = parameters.findIndex(
      x => x.id === layer.parameters_id
    );
    var plotFunction = layer.plotFunction;
    var min, max, array;

    if (plotFunction === "meteoSwissMarkers") {
      ({ min, max, array } = this.meteoSwissMarkersMinMax(layer));
    }
    if (plotFunction === "simstrat") {
      ({ min, max, array } = this.simstratMinMax(layer));
    }
    if (plotFunction === "remoteSensing") {
      ({ min, max, array } = this.remoteSensingMinMax(layer));
    }
    if (plotFunction === "meteolakesScalar") {
      ({ min, max, array } = this.meteolakesScalarMinMax(layer));
    }
    if (plotFunction === "meteolakesVector") {
      ({ min, max, array } = this.meteolakesVectorMinMax(layer));
    }

    maplayers[index].array = array;

    if (parameters[parameterIndex].min) {
      parameters[parameterIndex].min = Math.min(
        parameters[parameterIndex].min,
        min
      );
    } else {
      parameters[parameterIndex].min = min;
    }
    if (parameters[parameterIndex].max) {
      parameters[parameterIndex].max = Math.max(
        parameters[parameterIndex].max,
        max
      );
    } else {
      parameters[parameterIndex].max = max;
    }
    return { maplayers: maplayers, parameters: parameters };
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

  async componentDidMount() {
    // Get parameter details
    var { data: parameters } = await axios.get(
      apiUrl + "/selectiontables/parameters"
    );

    // Get maplayers
    var { data: maplayers } = await axios.get(apiUrl + "/maplayers");

    // Parse default settings from table
    maplayers.map(x => {
      x.colors = this.parseColor(x.colors);
      x.markerLabel = this.parseBoolean(x.markerLabel);
      x.markerFixedSize = this.parseBoolean(x.markerFixedSize);
      x.vectorMagnitude = this.parseBoolean(x.vectorMagnitude);
      x.vectorArrows = this.parseBoolean(x.vectorArrows);
      x.vectorFlow = this.parseBoolean(x.vectorFlow);
      x.vectorArrowColor = this.parseBoolean(x.vectorArrowColor);
      x.vectorFlowColor = this.parseBoolean(x.vectorFlowColor);
      x.legend = this.parseBoolean(x.legend);
      return x;
    });

    // Download default layers
    var { selected } = this.state;
    for (var i = 0; i < selected.length; i++) {
      maplayers = await this.downloadFile(selected[i], maplayers);
      ({ maplayers, parameters } = this.updateMinMax(
        selected[i],
        maplayers,
        parameters
      ));
    }

    this.setState({
      parameters,
      maplayers,
      loading: false
    });
  }

  render() {
    var { maplayers, parameters, selected, hidden, loading } = this.state;
    var {
      documentTitle,
      title,
      sidebarextratop,
      sidebarextrabottom
    } = this.props;
    document.title = documentTitle;

    maplayers = maplayers.map(layer => {
      var parameter = parameters.find(
        parameter => parameter.id === layer.parameters_id
      );
      layer.min = parameter.min;
      layer.max = parameter.max;
      layer.unit = parameter.unit;
      return layer;
    });
    if (maplayers.length < 1) selected = [];
    var selectlayers = selected.map(id =>
      maplayers.find(layer => layer.id === id)
    );
    return (
      <React.Fragment>
        <h1>{title}</h1>
        <GISMap
          maplayers={selectlayers}
          hidden={hidden}
          legend={<Legend maplayers={selectlayers} />}
          timeselector={<TimeSelector selectlayers={selectlayers} />}
          loading={loading}
          sidebar={
            <SidebarGIS
              maplayers={maplayers}
              parameters={parameters}
              selected={selected}
              hidden={hidden}
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
